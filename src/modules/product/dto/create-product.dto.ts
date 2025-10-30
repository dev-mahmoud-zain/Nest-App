import { Type } from "class-transformer";
import { IsMongoId, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";
import { Types } from "mongoose";
import { IProduct } from "src/common";

export class CreateProductDto implements Partial<IProduct> {
    @MaxLength(300)
    @MinLength(2)
    @IsString()
    name: string;

    @MaxLength(50000)
    @MinLength(2)
    @IsString()
    @IsOptional()
    description?: string;

    @IsMongoId()
    brand: Types.ObjectId;

    @IsMongoId()
    category: Types.ObjectId;

    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    stock?: number;

    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    originalPrice?: number;

    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    @IsOptional()
    discountPercent?: number;
}