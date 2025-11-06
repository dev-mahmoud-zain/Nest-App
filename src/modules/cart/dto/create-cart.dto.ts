import { Type } from "class-transformer";
import { IsMongoId, IsNumber, IsPositive, Min } from "class-validator";
import { Types } from "mongoose";



export class AddToCartCartParamDto  {

    @IsMongoId()
    productId: Types.ObjectId ;


    @Type(()=>Number)
    @Min(1)
    @IsPositive()
    @IsNumber()
    quantity: number;

}
