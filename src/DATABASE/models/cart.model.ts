import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ICart, ICartProduct, IProduct } from "src/common";



@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})

export class CartProduct implements ICartProduct {
    @Prop({ type: Types.ObjectId, ref: "Product", required: true })
    productId: Types.ObjectId | IProduct;

    @Prop({ type: Number,  required: true })
    quantity: number;
};


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})

export class Cart implements ICart {

    @Prop([{ type: CartProduct}])
    products: CartProduct[];

    @Prop({ type: Types.ObjectId, ref: "User", required: true ,unique:true })
    createdBy: Types.ObjectId

};

export const CartSchema = SchemaFactory.createForClass(Cart);


export type CartDocument = HydratedDocument<Cart>;
export type CartProductDocument = HydratedDocument<CartProduct>;


export const CartModel = MongooseModule.forFeature([
    { name: Cart.name, schema: CartSchema }
]);