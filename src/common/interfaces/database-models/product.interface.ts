import { Types } from "mongoose"

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