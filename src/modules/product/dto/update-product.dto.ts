import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {}


export class UpdateProductParamDto  {
    @IsMongoId()
    productId:Types.ObjectId;
}
