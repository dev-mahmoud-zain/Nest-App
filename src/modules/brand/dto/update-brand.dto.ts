import { IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateBrandDto {
    @IsOptional()
    @MaxLength(25)
    @MinLength(2)
    @IsString()
    name: string

    @IsOptional()
    @MaxLength(50)
    @MinLength(2)
    @IsString()
    slogan: string
}

export class UpdateBrandParamsDto {

    @IsMongoId()
    brandId: Types.ObjectId

}