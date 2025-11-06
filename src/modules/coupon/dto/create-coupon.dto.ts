import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { CouponEnum, ICoupon } from 'src/common';
import { IsFutureOrTodayConstraint } from 'src/common/decorators/date.decorator';

export class CreateCouponDto implements Partial<ICoupon> {
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  discount: number;

  @Min(1)
  @Max(5)
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(CouponEnum)
  type: CouponEnum;

  @Validate(IsFutureOrTodayConstraint)
  @Matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/, {
    message: 'date must be in the format DD-MM-YYYY',
  })
  startDate: Date;

  @Validate(IsFutureOrTodayConstraint)
  @Matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/, {
    message: 'date must be in the format DD-MM-YYYY',
  })
  endDate: Date;
}
