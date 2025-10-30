import { Product } from "src/DATABASE";

export class CreateProduct {
    newProduct: Product
}

export class UpdateProduct {
    updatedProduct: Product
}

export class getProduct {
    product: Product
}

export class getAllProducts {
    products: [Product]
}