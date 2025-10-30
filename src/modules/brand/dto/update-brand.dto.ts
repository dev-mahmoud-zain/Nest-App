import { IsMongoId} from 'class-validator';
import { Types } from 'mongoose';
import { CreateBrandDto } from './create-brand.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

export class UpdateBrandParamsDto {
    @IsMongoId()
    brandId: Types.ObjectId
}