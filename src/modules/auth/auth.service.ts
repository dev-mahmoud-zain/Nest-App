import { confirmEmailDto, loginDto, reSendOTPDto, signUpDto, signUpWithGmailDto } from "./dto";
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { Types } from "mongoose";
import { OTP_Repository, TokenRepository, UserDocument, UserRepository } from "src/DATABASE";
import { compareHash, EmailEventsEnum, generateOTP, OTP_TypeEnum, ProviderEnum } from "src/common";
import { TokenService } from "src/common/services/token.service";
import { CredentialsType } from "src/common/types/types";
import { emailEvent } from "src/common/utils/email";


@Injectable()
export class AuthService {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly otp_Repository: OTP_Repository,
        private readonly tokenService: TokenService
    ) { }


    private verifyGmailAccount = async (idToken: string): Promise<TokenPayload> => {

        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID as string,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequestException("Fail To Verify This Account")
        }
        return payload;
    }


    async signup(data: signUpDto): Promise<string> {

        const { userName, email, password, gender } = data

        if (await this.userRepository.findOne({
            filter: { email }
        })) {
            throw new ConflictException("Email Already Exists")
        }


        const [user] = await this.userRepository.create({
            data: [{
                userName,
                email,
                password,
                gender,
            }]
        }) || []

        if (!user) {
            throw new InternalServerErrorException("Fail To Signup")
        }

        const OTP_Code = generateOTP();

        if (!await this.otp_Repository.create({
            data: [{
                code: OTP_Code,
                createdBy: user._id,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                type: OTP_TypeEnum.confirm_Email
            }]
        })) {
            throw new InternalServerErrorException("Fail To Create OTP Number")
        }

        emailEvent.emit(EmailEventsEnum.confirm_Email, { OTP_Code, to: email })

        return `Your account has been created successfully. Please verify your email using the OTP code sent to your inbox.`;

    }

    async confirmEmail(data: confirmEmailDto): Promise<string> {
        const { email, OTP_Code } = data

        const user = await this.userRepository.getUser({
            filter: {
                email,
            }
        })

        if (user.emailConfirmedAt) {
            throw new BadRequestException("Email Is Already Confirmed")
        }

        const otp = await this.otp_Repository.findOne({
            filter: {
                createdBy: user._id,
                type: OTP_TypeEnum.confirm_Email,
            }
        })

        if (!otp) {
            throw new NotFoundException('OTP not found or expired.');
        }

        if (!await compareHash(OTP_Code, otp.code)) {
            throw new BadRequestException('Invalid OTP code.');
        }


        await Promise.all([
            this.userRepository.findOneAndUpdate({
                filter: {
                    _id: user._id
                },
                updateData: {
                    $set: {
                        emailConfirmedAt: new Date()
                    }
                }
            }),

            this.otp_Repository.deleteOne({
                _id: otp._id
            })
        ])

        return "Email Confirmed Success";

    }

    async resendConfirmEmailOTP(data: reSendOTPDto): Promise<string> {
        const { email } = data

        const user = await this.userRepository.getUser({
            filter: {
                email,
            }
        });

        if (user.emailConfirmedAt) {
            throw new BadRequestException("Email Is Already Confirmed")
        }

        const OTP_Code = generateOTP();

        if (! await Promise.all([
            this.otp_Repository.deleteOne({
                createdBy: user._id,
                type: OTP_TypeEnum.confirm_Email
            }),
            this.otp_Repository.create({
                data: [{
                    code: OTP_Code,
                    createdBy: user._id,
                    type: OTP_TypeEnum.confirm_Email,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
                }]
            })
        ])) {
            throw new BadRequestException("Fail To Resend OTP")
        }

        emailEvent.emit(EmailEventsEnum.confirm_Email, { to: email, OTP_Code })

        return "OTP Resent Success";

    }

    async login(data: loginDto): Promise<CredentialsType> {

        const { email, password } = data

        const user = await this.userRepository.findOne({
            filter: { email }
        }) as UserDocument

        if (!user) {
            throw new BadRequestException("User Not Exists , Need To Signup First")
        }

        if (!user.emailConfirmedAt) {
            throw new BadRequestException("Fail To login , Confirm Your Email First")
        }


        const credentials = await this.tokenService.createLoginCredentials(user)


        return credentials;

    }

    loginWithGmail = async (data: signUpWithGmailDto): Promise<CredentialsType> => {

        const { idToken }: signUpWithGmailDto = data

        const { email }: TokenPayload = await this.verifyGmailAccount(idToken)

        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: ProviderEnum.google
            }
        }) as UserDocument

        if (!user) {
            throw new NotFoundException("Not Registered Account Or Registered With Another Provider");
        }


        const credentials = await this.tokenService.createLoginCredentials(user)


        return credentials


    }

    signupWithGmail = async (data: signUpWithGmailDto): Promise<CredentialsType> => {

        const { idToken }: signUpWithGmailDto = data

        const { email, name }: TokenPayload = await this.verifyGmailAccount(idToken)

        const user = await this.userRepository.findOne({
            filter: {
                email
            }
        })

        if (user) {
            if (user.provider === ProviderEnum.system) {
                return await this.loginWithGmail(data)
            }
            throw new ConflictException("Invalid Provider", {
                cause: {
                    userProvider: user.provider
                }
            })
        }

        const [newUser] = await this.userRepository.create({
            data: [{
                userName: name as string,
                email: email as string,
                emailConfirmedAt: new Date()
            }]
        }) ||[] 


        if (!newUser) {
            throw new BadRequestException("Fail To Signup")
        }

        const credentials = await this.tokenService.createLoginCredentials(newUser)

        return credentials 

    }


}