import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../models";
import { DatabaseRepository } from "./database.repository";
import { Model, ProjectionType, QueryOptions, RootFilterQuery, Types } from "mongoose";
import { NotFoundException } from "@nestjs/common";
import { IUser } from "src/common";

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
    ): Promise<UserDocument> => {

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

    getProfile = async (_id: Types.ObjectId) => {

        const user: UserDocument = await this.getUser({
            filter: {
                _id
            },
            select: "-password -createdAt -updatedAt -emailConfirmedAt -provider -profilePicture.public_id"
        })

        const responseUser = {
            ...user.toObject(),
            profilePicture: user.profilePicture?.url || null,
        }

        return responseUser

    }

}