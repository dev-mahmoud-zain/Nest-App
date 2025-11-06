import { Controller, Get, MaxFileSizeValidator, ParseFilePipe, Patch, Req, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { UsersService } from "./users.service";
import { fileValidation, SetTokenType } from "src/common";
import { TokenTypeEnum } from "src/common/enums/token.enums";
import { AuthenticationGuard } from "src/common/guards/authentication/authentication.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { cloudFileUpload } from "src/common/utils/multer/cloud.multer.options";
import type { IRequest, IResponse, IUserResponse  } from "src/common";
import { Types } from "mongoose";
import { ProfileResponse } from "./users.entity";
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) { }




    @SetTokenType(TokenTypeEnum.access)
    @UseGuards(AuthenticationGuard)
    @Get("profile")
    getProfile(
        @Request() req: IRequest
    ): Promise<IResponse<ProfileResponse>> {
        return this.usersService.getProfile(req.credentials?.user._id as Types.ObjectId);
    }

    // Local Uploads
    // @UseGuards(AuthenticationGuard)
    // @UseInterceptors(FileInterceptor(
    //     "profile-picture", localFileUpload({
    //         folder: "profile-images",
    //         validation: fileValidation.image
    //     })))
    // @Patch("upload-profile-picture")
    // uploadProfilePicture(
    //     @UploadedFile(
    //         new ParseFilePipe({
    //             validators: [
    //                 new MaxFileSizeValidator({
    //                     maxSize: 2 * 1024 * 1024,
    //                 })
    //             ]
    //         })
    //     ) file: Express.Multer.File,
    //     @Req() req: Request
    // ) {
    //     return this.usersService.uploadProfilePicture(file)
    // }

    // @UseGuards(AuthenticationGuard)
    // @UseInterceptors(FilesInterceptor("profile-cover", 2,
    //     localFileUpload({
    //         folder: "profile-images",
    //         validation: fileValidation.image
    //     })))
    // @Patch("upload-profile-cover")
    // uploadProfileCover(
    //     @UploadedFiles(
    //         new ParseFilePipe({
    //             validators: [
    //                 new MaxFileSizeValidator({
    //                     maxSize: 5 * 1024 * 1024,
    //                 })
    //             ]
    //         })
    //     ) files: Array<Express.Multer.File>
    // ) {
    //     return this.usersService.uploadProfileCover(files)
    // }


    // @UseGuards(AuthenticationGuard)
    // @UseInterceptors(FileFieldsInterceptor(
    //     [{ name: "profile-picture", maxCount: 1 },
    //     { name: "profile-cover", maxCount: 2 }],
    //     localFileUpload({
    //         folder: "profile-images",
    //         validation: fileValidation.image
    //     })))
    // @Patch("upload-profile-fields")
    // uploadProfilePictureAndCover(
    //     @UploadedFiles(
    //         new ParseFilePipe({
    //             // validators: [
    //             //     new MaxFileSizeValidator({
    //             //         maxSize: 5 * 1024 * 1024,
    //             //     })
    //             // ]
    //         })
    //     ) files: {
    //         "profile-picture": Array<Express.Multer.File>,
    //         "profile-cover": Array<Express.Multer.File>
    //     }
    // ) {
    //     return this.usersService.uploadProfilePictureAndCover(files)
    // }

    // Cloud Uploads

    @UseGuards(AuthenticationGuard)
    @UseInterceptors(FileInterceptor(
        "profile-picture", cloudFileUpload({
            validation: fileValidation.image
        })))
    @Patch("upload-profile-picture")
    uploadProfilePicture(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 2 * 1024 * 1024,
                    })
                ]
            })
        ) file: Express.Multer.File,
        @Req() req: IRequest
    ) {
        const userId = req.credentials?.user._id as Types.ObjectId;
        return this.usersService.uploadProfilePicture(file, userId)
    }
}