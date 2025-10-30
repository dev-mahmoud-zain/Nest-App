import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { Product, ProductDocument } from "../models";

export class ProductRepository extends DatabaseRepository<Product> {
    constructor(
        @InjectModel(Product.name)
        protected override readonly model: Model<ProductDocument>
    ) {
        super(model)
    }
}