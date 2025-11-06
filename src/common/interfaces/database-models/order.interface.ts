import { Types } from 'mongoose';
import { IProduct } from './product.interface';
import { OrderStatusEnum, PaymentTypeEnum } from 'src/common/enums';
import { IUser } from './user.interface';

export interface IOrderProduct {
  _id?: Types.ObjectId;

  name: string;

  description: string;

  images:string[];

  productId: Types.ObjectId | IProduct;
  quantity: number;

  unitPrice: number;

  totalPrice: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrder {
  _id?: Types.ObjectId;

  orderId: string;

  address: string;
  phone: string;
  note?: string;

  products: IOrderProduct[];

  subtotal: number;

  coupon?: Types.ObjectId;

  discount?: number;
  finalTotal: number;

  paymentType: PaymentTypeEnum;
  status: OrderStatusEnum;

  paymentIntent: string;

  cancelReason?: string;

  createdBy: Types.ObjectId | IUser;

  updatedBy?: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;

  freezedAt?: Date;
  freezedBy?: Date;
}
