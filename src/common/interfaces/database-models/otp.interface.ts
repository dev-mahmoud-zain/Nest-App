import { Types } from "mongoose";
import { OTP_TypeEnum } from "../../enums";

export interface I_OTP {
    _id?: Types.ObjectId,

    code: string,
    expiresAt: Date,
    createdBy: Types.ObjectId,
    type: OTP_TypeEnum,

    createdAt?: Date,
    updatedAt?: Date,
}