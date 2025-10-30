import { IsArray, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Types } from "mongoose";
import { IBrand, ICategory } from "src/common";

export class CreateCategoryDto implements Partial<ICategory> {

    @MaxLength(25)
    @MinLength(2)
    @IsString()
    name: string

    @IsOptional()
    @MaxLength(5000)
    @MinLength(2)
    @IsString()
    description?: string | undefined;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    brands?: Types.ObjectId[] ;
}