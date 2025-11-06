import { Types } from 'mongoose';
import { CouponEnum } from 'src/common/enums';

export interface ICoupon {
  _id?: Types.ObjectId;

  couponId:string;

  name: string;
  slug: string;

  image?: {
    url: string;
    public_id: string;
  };


  startDate:Date;
  endDate:Date;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  usedBy?: [Types.ObjectId];

  duration:number;

  discount:number;
  type:CouponEnum;

  freezedAt?: Date;
  freezedBy?: Types.ObjectId;

  restoredAt?: Date;
  restoredBy?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}
