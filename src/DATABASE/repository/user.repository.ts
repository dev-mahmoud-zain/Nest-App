import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../models";
import { DatabaseRepository } from "./database.repository";
import { Model, ProjectionType, QueryOptions, RootFilterQuery } from "mongoose";
import { NotFoundException } from "@nestjs/common";

export class UserRepository extends DatabaseRepository<User> {

    constructor(
        @InjectModel(User.name)
        protected override readonly model: Model<UserDocument>
    ) {
        super(model)
    }

    getUser = async (
        {
                filter,
                select,
                options
            }: {
                filter?: RootFilterQuery<UserDocument>,
                select?: ProjectionType<UserDocument> | null,
                options?: QueryOptions<UserDocument> & { populate?: any } | null
            }
    ):Promise<UserDocument> => {

        const user = await this.findOne({
            filter,
            options,
            select
        }) as UserDocument

        if (!user) {
            throw new NotFoundException("User Not Found");
        }

        return user;

    }

}