import { Brand } from "src/DATABASE";

export class CreateBrand {
    newBrand: Brand;
}

export class UpdatedBrand {
    updatedBrand: Brand;
}

export class RestoreBrand {
    restoredBrand: Brand;
}

export class GetAllBrands {

    brands: Brand[];
    pagination: {
        page: number,
        limit: number,
        totalPages: number,
        total: number,
    }

}


export class GetOneBrand {
    brand: Brand;
}