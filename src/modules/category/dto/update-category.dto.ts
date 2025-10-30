import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { CreateCategoryDto } from './create-category.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}


export class UpdateCategoryParamsDto {
    @IsMongoId()
    categoryId: Types.ObjectId
}