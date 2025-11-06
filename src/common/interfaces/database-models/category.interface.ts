import { Types } from "mongoose";
import { IBrand } from "./brand.interface";

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