import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { Cart, CartDocument } from "../models";

export class CartRepository extends DatabaseRepository<Cart> {

    constructor(
        @InjectModel(Cart.name)
        protected override readonly model: Model<CartDocument>
    ) {
        super(model)
    }



}