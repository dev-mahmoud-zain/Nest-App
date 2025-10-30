import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import {  Model } from "mongoose";
import { Brand, BrandDocument } from "../models";

export class BrandRepository extends DatabaseRepository<Brand> {

    constructor(
        @InjectModel(Brand.name)
        protected override readonly model: Model<BrandDocument>
    ) {
        super(model)
    }



}