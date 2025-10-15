import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose"
import { HydratedDocument, UpdateQuery } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "src/common/enums";
import { generateHash } from "src/common/utils";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class User {

    @Prop({ type: String, min: 2, max: 30, required: true })
    firstName: string

    @Prop({ type: String, min: 2, max: 30, required: true })
    lastName: string

    @Virtual({
        get: function (this: User) {
            return this.firstName + " " + this.lastName;
        },
        set: function (value: string) {
            const [firstName, lastName] = value.split(" ");
            this.set({ firstName, lastName });
        },
    })
    userName: string

    @Prop({ type: String, required: true, unique: true })
    email: string

    @Prop({ type: Date, required: false })
    emailConfirmedAt: Date

    @Prop({ type: String, enum: ProviderEnum, default: ProviderEnum.system })
    provider: ProviderEnum

    @Prop({ type: String, enum: RoleEnum, default: RoleEnum.user })
    role: RoleEnum

    @Prop({
        type: String, required: function (this: User) {
            return this.provider === ProviderEnum.system ? true : false
        }
    })
    password: string

    @Prop({ type: String, enum: GenderEnum, default: GenderEnum.male })
    gender: GenderEnum

    @Prop({ type: Date, required: false })
    changeCredentialsTime: Date

}


const userSchema = SchemaFactory.createForClass(User);

userSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        this.password = await generateHash(this.password);
    }
    next()
})

userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
    const update = this.getUpdate() as UpdateQuery<any>;
    if (!update) return next();

    const setData = update.$set || update;

    if (setData.password) {
        setData.password = await generateHash(setData.password);
    }

    if (setData.OTP_Code) {
        setData.OTP_Code = await generateHash(setData.OTP_Code);
    }

    next();
});



export type UserDocument = HydratedDocument<User>;

export const UserModel = MongooseModule.forFeature([
    { name: User.name, schema: userSchema }
])