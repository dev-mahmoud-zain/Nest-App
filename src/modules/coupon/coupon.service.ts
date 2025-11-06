import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Types } from 'mongoose';
import { CouponRepository } from 'src/DATABASE';
import { response } from 'src/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { randomUUID } from 'node:crypto';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

@Injectable()
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  async createCoupon(createCouponDto: CreateCouponDto, userId: Types.ObjectId) {

    if (
      await this.couponRepository.findOne({
        filter: {
          name: createCouponDto.name,
        },
        pranoId: true,
      })
    ) {
      throw new BadRequestException('Duplicated Coupon Name');
    }

    createCouponDto.startDate = dayjs
      .utc(createCouponDto.startDate, 'DD-MM-YYYY', true)
      .toDate();

    createCouponDto.endDate = dayjs
      .utc(createCouponDto.endDate, 'DD-MM-YYYY', true)
      .toDate();


    const [coupon] =
      (await this.couponRepository.create({
        data: [
          {
            ...createCouponDto,
            createdBy: userId,
            couponId:randomUUID().slice(0,8)
          },
        ],
      })) || [];

      if(!coupon){
        throw new InternalServerErrorException("Fail to Create Coupon")
      }

    return response({
      data:{coupon},
      statusCode:201
    });

  }
}
