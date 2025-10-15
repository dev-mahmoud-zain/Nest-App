import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { generateHash, OTP_TypeEnum } from "src/common";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class OTP {
    @Prop({ type: String, required: true })
    code: string

    @Prop({ type: Date, required: true })
    expiresAt: Date

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId

    @Prop({ type: String, enum: OTP_TypeEnum, required: true })
    type: OTP_TypeEnum
};

const OTP_Schema = SchemaFactory.createForClass(OTP);

OTP_Schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OTP_Schema.pre("save", async function (next) {

    if (this.isModified("code")) {
        this.code = await generateHash(this.code)
    }
    next()
}
)


export type OTP_Document = HydratedDocument<OTP>;

export const OTP_Model = MongooseModule.forFeature([
    { name: OTP.name, schema: OTP_Schema }
]);