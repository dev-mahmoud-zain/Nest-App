import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import {  Model } from "mongoose";
import { Order, OrderDocument } from "../models";

export class OrderRepository extends DatabaseRepository<Order> {

    constructor(
        @InjectModel(Order.name)
        protected override readonly model: Model<OrderDocument>
    ) {
        super(model)
    }



}