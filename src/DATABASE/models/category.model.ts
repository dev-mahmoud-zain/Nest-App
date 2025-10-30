import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { IBrand, ICategory } from "src/common";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})

export class Category implements ICategory {

    @Prop({ type: String, required: true, unique: true, min: 2, maxLength: 25 })
    name: string;

    @Prop({ type: String, min: 2, maxLength: 50 })
    slug: string;

    @Prop({ type: String, required: true, min: 2, maxLength: 5000 })
    description: string;

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


    @Prop([{ type: Types.ObjectId, ref: "Brand"}])
    brands?: Types.ObjectId[] | IBrand[] | undefined;

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

const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre("save", function (next) {

    if (this.isModified("name")) {
        this.slug = slugify(this.name);
    }
    next();

})

CategorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type CategoryDocument = HydratedDocument<Category>;

export const CategoryModel = MongooseModule.forFeature([
    { name: Category.name, schema: CategorySchema }
]);