import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { IOrder, PaymentTypeEnum } from 'src/common';

export class CreateOrderDto implements Partial<IOrder> {
  @IsString()
  address: string;

  @MaxLength(500)
  @MinLength(2)
  @IsOptional()
  @IsString()
  note: string;

  @Matches(/^(\+2010|\+2011|\+2012|\+2015|010|011|012|015)\d{8}$/, {
    message: 'Phone Must Be Valid With Egyptian Phone Number Only',
  })
  @IsString()
  phone: string;

  @IsEnum(PaymentTypeEnum)
  paymentType: PaymentTypeEnum;

  @Length(8)
  @IsString()
  @IsOptional()
  coupon?: Types.ObjectId;
}


