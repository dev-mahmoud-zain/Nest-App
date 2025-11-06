import { IsMongoId } from "class-validator";
import { Types } from "mongoose";

export class addToWishlistDto {
    @IsMongoId()
    productId:Types.ObjectId
}