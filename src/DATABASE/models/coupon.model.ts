import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { CouponEnum, ICoupon } from 'src/common';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Coupon implements ICoupon {

  @Prop({ type: String, required: true, unique: true, min: 2, maxLength: 25 })
  name: string;

  @Prop({ type: String, required: true, unique: true, length: 8 })
  couponId: string;

  @Prop({ type: String, min: 2, maxLength: 50 })
  slug: string;

  @Prop({ type: Number, required: true })
  discount: number;

  @Prop({ type: Number, required: true, max: 5, min: 1 })
  duration: number;

  @Prop([{ type: Types.ObjectId, ref: 'User', required: true }])
  usedBy?: [Types.ObjectId];

  @Prop({ enum: CouponEnum, required: true, default: CouponEnum.percentage })
  type: CouponEnum;

  @Prop({
    type: {
      url: { type: String },
      public_id: { type: String },
    },
    _id: false,
    default: null,
  })
  image: {
    url: string;
    public_id: string;
  };

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Date })
  freezedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  freezedBy?: Types.ObjectId;

  @Prop({ type: Date })
  restoredAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  restoredBy?: Types.ObjectId;
}

const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

CouponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type CouponDocument = HydratedDocument<Coupon>;

export const CouponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: CouponSchema },
]);
