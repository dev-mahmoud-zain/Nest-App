import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { Wishlist, WishlistDocument } from "../models";

export class WishlistRepository extends DatabaseRepository<Wishlist> {

    constructor(
        @InjectModel(Wishlist.name)
        protected override readonly model: Model<WishlistDocument>
    ) {
        super(model)
    }



}