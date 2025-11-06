import { IsMongoId, Validate } from "class-validator";
import { Types } from "mongoose";

export class RemoveFromCartDto {

    @IsMongoId({ each: true })
    products: Types.ObjectId[]

}