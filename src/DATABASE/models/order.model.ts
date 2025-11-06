import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import {
  IOrder,
  IOrderProduct,
  IProduct,
  IUser,
  OrderStatusEnum,
  PaymentTypeEnum,
} from 'src/common';
import { Coupon } from './coupon.model';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class OrderProduct implements IOrderProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId | IProduct;

  @Prop({ type: String, required: true })
  description: string;

  @Prop([{ type: String, required: true }])
  images: string[];

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  unitPrice: number;

  @Prop({ type: Number, required: true })
  totalPrice: number;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Order implements IOrder {
  @Prop({ type: String, required: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId | IUser;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId | IUser;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop([{ type: OrderProduct, required: true }])
  products: OrderProduct[];

  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number })
  discount: number;

  @Prop({ type: Number, required: true })
  finalTotal: number;

  @Prop({ type: String })
  note?: string | undefined;

  @Prop({ type: String, enum: PaymentTypeEnum, default: PaymentTypeEnum.cash })
  paymentType: PaymentTypeEnum;

  @Prop({ type: String, required: false })
  paymentIntent: string;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  coupon?: Types.ObjectId;

  @Prop({
    type: String,
    enum: OrderStatusEnum,
    default: function (this: Order) {
      return this.paymentType === PaymentTypeEnum.card
        ? OrderStatusEnum.pending
        : OrderStatusEnum.placed;
    },
  })
  status: OrderStatusEnum;

  @Prop({ type: String })
  cancelReason?: string | undefined;

  @Prop({ type: Date })
  freezedAt?: Date | undefined;

  @Prop({ type: Date })
  freezedBy?: Date | undefined;
}

const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre('validate', function (next) {
  if (this.discount) this.finalTotal = this.subtotal - this.discount;
  else this.finalTotal = this.subtotal;

  next();
});

export type OrderProductDocument = HydratedDocument<OrderProduct>;
export type OrderDocument = HydratedDocument<Order>;

export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
]);
