import { IsMongoId } from "class-validator";
import { Types } from "mongoose";

export class CheckOutParamDto {
    @IsMongoId()
    orderId:Types.ObjectId
}