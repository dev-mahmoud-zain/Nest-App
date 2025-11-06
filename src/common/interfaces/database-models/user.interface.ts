import { Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "src/common/enums";

export interface IUser {

    _id?: Types.ObjectId,

    firstName: string,
    lastName: string,
    userName?: string,

    email: string,
    emailConfirmedAt?: Date,

    provider: ProviderEnum,

    role: RoleEnum,

    password?: string,

    gender: GenderEnum,

    changeCredentialsTime?: Date,

    profilePicture?: {
        url: string,
        public_id: string,
    },

    createdAt?: Date,
    updatedAt?: Date,
}

export type IUserResponse = Omit<IUser, 'profilePicture'> & { profilePicture: string | null };