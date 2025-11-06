import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import {  Model } from "mongoose";
import { Category, CategoryDocument } from "../models";

export class CategoryRepository extends DatabaseRepository<Category> {

    constructor(
        @InjectModel("Category")
        protected override readonly model: Model<CategoryDocument>
    ) {
        super(model)
    }

}