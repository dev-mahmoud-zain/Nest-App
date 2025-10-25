import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { generateHash, I_OTP, IBrand, OTP_TypeEnum } from "src/common";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})

export class Brand implements IBrand {

    @Prop({ type: String, required: true, unique: true, min: 2, maxLength: 25 })
    name: string;

    @Prop({ type: String ,min: 2, maxLength: 50 })
    slug: string;

    @Prop({ type: String, required: true ,min: 2, maxLength: 50 })
    slogan: string;

    @Prop({
        type: {
            url: { type: String },
            public_id: { type: String },
        },
        _id: false,
        default: null,
    })
    image: {
        url: string,
        public_id: string,
    };

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId

};

const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.pre("save", function (next) {

    if (this.isModified("name")) {
        this.slug = slugify(this.name);
    }
    next();

})

BrandSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


export type BrandDocument = HydratedDocument<Brand>;

export const BrandModel = MongooseModule.forFeature([
    { name: Brand.name, schema: BrandSchema }
]);