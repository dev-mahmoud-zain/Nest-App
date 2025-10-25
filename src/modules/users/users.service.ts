import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { IResponse, IUserResponse, response } from "src/common";
import { uploadToCloudinary } from "src/common/utils/cloudinary";
import { UserRepository } from "src/DATABASE";
import { ProfileResponse } from "./users.entity";


@Injectable()
export class UsersService {

    constructor(private readonly usersService: UserRepository) { }


    async getProfile(_id: Types.ObjectId): Promise<IResponse<ProfileResponse>> {
        const user = await this.usersService.getProfile(_id);
        if (!user) {
            throw new BadRequestException("Fail To Get Profile")
        }
        return response({
            data: { profile: user }
        })
    }



    async uploadProfilePicture(file: Express.Multer.File, userId: Types.ObjectId) {

        const cloudinaryFolder = `E_Commerce/users/${userId}/profile-pictures`;

        try {
            const result = await uploadToCloudinary(file, cloudinaryFolder);


            const user = await this.usersService.findOneAndUpdate({
                filter: {
                    _id: userId
                }, updateData: {
                    $set: {
                        profilePicture: {
                            url: result.url,
                            public_id: result.public_id,
                        }
                    }
                }
            })



            return {
                message: 'Profile Picture Uploaded Successfully',
                user,
                url: result.secure_url,
                public_id: result.public_id,
            };
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Error uploading file to Cloudinary');
        }




    }


    uploadProfileCover(files: Array<Express.Multer.File>) {
        return files;
    }


    uploadProfilePictureAndCover(
        files: {
            "profile-picture": Array<Express.Multer.File>,
            "profile-cover": Array<Express.Multer.File>
        }
    ) {
        return files;
    }

}