import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { OTP, OTP_Document } from "../models";

export class OTP_Repository extends DatabaseRepository<OTP> {

    constructor(
        @InjectModel(OTP.name)
        protected override readonly model: Model<OTP_Document>
    ) {
        super(model)
    }

}