import { Category } from "src/DATABASE";

export class CreateCategory {
    newCategory: Category;
}

export class UpdatedCategory {
    updatedCategory: Category;
}

export class RestoreCategory {
    restoredCategory: Category;
}

export class GetAllCategories{

    categories: Category[];
    pagination: {
        page: number,
        limit: number,
        totalPages: number,
        total: number,
    }

}

export class GetOneCategory {
    category: Category;
}