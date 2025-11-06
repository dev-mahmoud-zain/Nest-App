import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import {  Model } from "mongoose";
import { Coupon, CouponDocument } from "../models";

export class CouponRepository extends DatabaseRepository<Coupon> {
    constructor(
        @InjectModel(Coupon.name)
        protected override readonly model: Model<CouponDocument>
    ) {
        super(model)
    }
}