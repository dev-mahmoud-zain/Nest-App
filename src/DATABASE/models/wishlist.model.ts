import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IProduct, IWishlist, IWishlistProduct } from "src/common";


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})

export class WishlistProduct implements IWishlistProduct {
    @Prop({ type: Types.ObjectId, ref: "Product", required: true })
    productId: Types.ObjectId | IProduct; 
};


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class Wishlist implements IWishlist {

    @Prop([{ type: WishlistProduct}])
    products: WishlistProduct[];

    @Prop({ type: Types.ObjectId, ref: "User", required: true ,unique:true })
    createdBy: Types.ObjectId

};

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);


export type WishlistDocument = HydratedDocument<Wishlist>;
export type WishlistProductDocument = HydratedDocument<WishlistProduct>;


export const WishlistModel = MongooseModule.forFeature([
    { name: Wishlist.name, schema: WishlistSchema }
]);