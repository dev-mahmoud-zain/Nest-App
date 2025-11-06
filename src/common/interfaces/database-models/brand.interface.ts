import { Types } from "mongoose";

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