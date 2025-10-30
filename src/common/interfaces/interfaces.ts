import { Request } from "express"
import { JwtPayload } from "jsonwebtoken"
import { UserDocument } from "src/DATABASE"
import { GenderEnum, OTP_TypeEnum, ProviderEnum, RoleEnum } from "../enums"
import { Types } from "mongoose"


// ============== DataBase Models Interfaces ==============

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

export interface I_OTP {
    _id?: Types.ObjectId,

    code: string,
    expiresAt: Date,
    createdBy: Types.ObjectId,
    type: OTP_TypeEnum,

    createdAt?: Date,
    updatedAt?: Date,
}

export interface IToken {
    _id?: Types.ObjectId,

    jti: string,
    expiresAt: Date,
    createdBy: Types.ObjectId,

    createdAt?: Date,
    updatedAt?: Date,
}

export interface IBrand {
    _id?: Types.ObjectId,

    name: string,
    slug: string,
    slogan: string,

    createdBy: Types.ObjectId,
    updatedBy?: Types.ObjectId,

    image?: {
        url: string,
        public_id: string,
    },


    freezedAt?: Date,
    freezedBy?: Types.ObjectId,

    restoredAt?: Date,
    restoredBy?: Types.ObjectId,

    createdAt?: Date,
    updatedAt?: Date,
}


export interface ICategory {
    _id?: Types.ObjectId,

    name: string,
    slug: string,
    description: string,

    image?: {
        url: string,
        public_id: string,
    },

    brands?: Types.ObjectId[] | IBrand[]

    createdBy: Types.ObjectId,
    updatedBy?: Types.ObjectId,


    freezedAt?: Date,
    freezedBy?: Types.ObjectId,

    restoredAt?: Date,
    restoredBy?: Types.ObjectId,

    createdAt?: Date,
    updatedAt?: Date,
}


export interface IProduct {
    _id?: Types.ObjectId,

    name: string,
    slug: string,
    description: string,

    images?: [{
        url: string,
        public_id: string,
    },]

    brand: Types.ObjectId,
    category: Types.ObjectId,

    originalPrice: number,
    discountPercent: number,

    salePrice: number,

    stock: number,
    soldItems: number

    createdBy: Types.ObjectId,
    updatedBy?: Types.ObjectId,


    freezedAt?: Date,
    freezedBy?: Types.ObjectId,

    restoredAt?: Date,
    restoredBy?: Types.ObjectId,

    createdAt?: Date,
    updatedAt?: Date,
}


// ============== Common Interfaces ==============

export interface IMulterFile extends Express.Multer.File {
    finalPath?: string
}

export interface IRequest extends Request {
    credentials?: {
        user: Partial<UserDocument>,
        decoded: JwtPayload
    }
}

// ============== Response Interface ==============

export interface IResponse<T = any> {
    message?: string,
    statusCode?: number,
    data?: T
}


export interface IImage {
    url: string,
    public_id: string
}