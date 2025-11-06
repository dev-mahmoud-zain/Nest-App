import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { IProduct } from "src/common";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})

export class Product implements IProduct {

    @Prop({ type: String, required: true, min: 2, maxLength: 300 })
    name: string;

    @Prop({ type: String, min: 2, maxLength: 50 })
    slug: string;

    @Prop({ type: String, required: true, min: 2, maxLength: 50000 })
    description: string;

    @Prop([{
        type: {
            url: { type: String },
            public_id: { type: String },
            _id: false,
        },
        default: [],
    },])
    images: [{
        url: string,
        public_id: string,
    }];

    @Prop({ type: Types.ObjectId, ref: "Brand" })
    brand: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Category" })
    category: Types.ObjectId;

    @Prop({ type: Number, required: true })
    originalPrice: number;

    @Prop({ type: Number, default: 0 })
    discountPercent: number;

    @Prop({ type: Number, required: true })
    salePrice: number;

    @Prop({ type: Number, default: 0 })
    soldItems: number;

    @Prop({ type: Number, required: true })
    stock: number;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId

    @Prop({ type: Date })
    freezedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: "User" })
    freezedBy?: Types.ObjectId;

    @Prop({ type: Date })
    restoredAt?: Date;

    @Prop({ type: Types.ObjectId, ref: "User" })
    restoredBy?: Types.ObjectId;

};

const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre("validate", function (next) {

    if (this.isModified("name")) {
        this.slug = slugify(this.name);
    }

    if (this.isModified("originalPrice") || this.isModified("discountPercent")) {
        this.salePrice = parseFloat(Number(this.originalPrice - (this.originalPrice * ((this.discountPercent ?? 0) / 100))).toFixed(2))
    }

    next();

})


export type ProductDocument = HydratedDocument<Product>;

export const ProductModel = MongooseModule.forFeature([
    { name: Product.name, schema: ProductSchema }
]);