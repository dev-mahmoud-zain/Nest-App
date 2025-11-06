import { Types } from "mongoose";
import { IProduct } from "./product.interface";

export interface IWishlistProduct {
    _id?: Types.ObjectId,
    productId: Types.ObjectId | IProduct,
    createdAt?: Date,
    updatedAt?: Date,
}


export interface IWishlist {
    _id?: Types.ObjectId,

    createdBy: Types.ObjectId,

    products: IWishlistProduct[],

    createdAt?: Date,
    updatedAt?: Date,
}