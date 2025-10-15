import {
    CreateOptions,
    FilterQuery,
    FlattenMaps,
    HydratedDocument,
    Model,
    MongooseUpdateQueryOptions,
    ProjectionType,
    QueryOptions,
    RootFilterQuery,
    UpdateQuery,
    UpdateWriteOpResult,
} from "mongoose";


type UpdateOptionsFixed = {
    upsert?: boolean;
    writeConcern?: any;
    collation?: any;
    arrayFilters?: any[];
    session?: any;
}


export abstract class DatabaseRepository<TRawDocument,
    TDocument = HydratedDocument<TRawDocument>> {

    protected constructor(protected model: Model<TDocument>) { }


    async create({ data, options }: {
        data: Partial<TDocument>[];
        options?: CreateOptions | undefined;
    }): Promise<TDocument[] | undefined> {
        return await this.model.create(data, options)
    }

    async findOne({
        filter,
        select,
        options
    }: {
        filter?: RootFilterQuery<TDocument>,
        select?: ProjectionType<TDocument> | null,
        options?: QueryOptions<TDocument> & { populate?: any } | null
    }): Promise<
        FlattenMaps<TDocument>
        | TDocument
        | null> {

        const doc = this.model.findOne(filter).select(select || "");

        if (options?.lean) {
            doc.lean(options.lean)
        }

        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }

    async find({
        filter = {},
        projection = null,
        options = {},
        page = 1,
        limit = 10,
        sort = {}
    }: {
        filter?: FilterQuery<TDocument>,
        projection?: ProjectionType<TDocument> | null,
        options?: QueryOptions,
        page?: number,
        limit?: number,
        sort?: Record<string, 1 | -1>
    }) {

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.model.find(filter, projection, {
                ...options,
                skip,
                limit,
                sort
            }).exec(),
            this.model.countDocuments(filter).exec()
        ]);

        return {
            data,
            pagination: {
                page,
                totalPages: Math.ceil(total / limit),
                limit,
                totalPosts: total
            }
        };
    }

    async updateOne(
        filter: FilterQuery<TDocument>,
        updateData: UpdateQuery<TDocument>,
        options?: MongooseUpdateQueryOptions<TDocument> | null
    ): Promise<UpdateWriteOpResult> {

        if (Array.isArray(updateData)) {

            updateData.push({
                $set: {
                    __v: { $add: ["$__v", 1] }
                },
            })

            return await this.model.updateOne(
                filter || {},
                updateData,
                options
            );

        }

        return await this.model.updateOne(
            filter || {},
            {
                ...updateData,
                $inc: { __v: 1 }
            },
            options
        );

    }

    async findOneAndUpdate(
        {
            filter,
            updateData,
            options
        }: {
            filter?: RootFilterQuery<TDocument>,
            updateData: UpdateQuery<TDocument>,
            options?: QueryOptions<TDocument> | null
        }): Promise<TDocument | null> {

        const updatedDoc = await this.model.findOneAndUpdate(
            filter,
            {
                ...updateData,
                $inc: { __v: 1 }
            },
            options
        ).exec();

        return updatedDoc;
    }

    async updateMany(
        filter: FilterQuery<TDocument>,
        updateData: UpdateQuery<TDocument>,
        options: UpdateOptionsFixed = {}
    ) {
        return this.model.updateMany(filter, updateData, options).exec();
    }

    async deleteOne(
        filter: FilterQuery<TDocument>
    ) {

        return this.model.deleteOne(filter)
    }

    async deleteMany(
        filter: FilterQuery<TDocument>
    ) {
        return this.model.deleteMany(filter);
    }

    async findOneAndDelete(
        {
            filter,
            options
        }: {
            filter?: RootFilterQuery<TDocument>,
            options?: QueryOptions<TDocument> | null
        }
    ): Promise<TDocument | null> {

        const deletedDoc = await this.model.findOneAndDelete(
            filter,
            options || {}
        ).exec();

        return deletedDoc;
    }

}