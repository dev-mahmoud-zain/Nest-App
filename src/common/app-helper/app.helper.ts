import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { Brand, BrandDocument, Category, Product } from "src/DATABASE";
import { BrandRepository } from "src/DATABASE/repository/brand.repository";
import { CategoryRepository } from "src/DATABASE/repository/category.repository";
import { ProductRepository } from "src/DATABASE/repository/product.repository";


interface IBaseRepository<T> {
    findOne(options: { filter: any }): Promise<T | null>;
}

@Injectable()
export class AppHelper {
    constructor(
        private readonly brandRepository: BrandRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly productRepository: ProductRepository,
    ) { }


    private async checkDocumentExists<T>(
        repository: IBaseRepository<T>,
        _id: Types.ObjectId
    ): Promise<T | false> {
        const document = await repository.findOne({ filter: { _id } });
        return document || false;
    }


    checkDuplicates(arr: any[], name: string) {
        const seen = new Set();
        const duplicates = arr.filter(id => {
            if (seen.has(id)) return true;
            seen.add(id);
            return false;
        });

        if (duplicates.length > 0) {
            throw new BadRequestException({
                statusCode: 400,
                message: `Some ${name} values are duplicated`,
                error: "Bad Request",
                details: {
                    duplicates,
                    count: duplicates.length,
                },
            });
        }
    }



    checkBrands = async function (ids: Types.ObjectId[] | string[], brands: BrandDocument[]) {

        await this.checkDuplicates(ids, "Brand Id's");

        const brandIds = brands.map(b => b._id.toString());


        if (ids.length !== brandIds.length) {
            const extraIds = ids
                .map(id => id.toString())
                .filter(id => !brandIds.includes(id));
            throw new NotFoundException(`Invalid Brand IDs: ${extraIds.join(", ")}`);
        }

    }


    async checkBrandExists(_id) {
        const brand = await this.checkDocumentExists(this.brandRepository, _id);
        return brand as Brand
    }

    async checkCategoryExists(_id) {
        const category = await this.checkDocumentExists(this.categoryRepository, _id);
        return category as Category
    }

    async checkProductExists(_id) {
        const product = await this.checkDocumentExists(this.productRepository, _id);
        return product as Product
    }




    async checkBrandAndCategory(brandId: Types.ObjectId, categoryId: Types.ObjectId) {

        const issues: { path: string, info: string }[] = []

        const [brand, category] = await Promise.all([
            this.checkBrandExists(brandId),
            this.checkCategoryExists(categoryId),
        ]);

        if (!brand) {
            issues.push({ path: "brand", info: `Brand ID ${brandId} Not Found` });
        }

        if (!category) {
            issues.push({ path: "category", info: `Category ID ${categoryId} Not Found` });
        }

        if (issues.length) {
            throw new NotFoundException({
                statusCode: 404,
                message: "Some related entities were Not Found",
                error: "Not Found",
                issues,
            });
        }

    }



}
