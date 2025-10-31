import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Types } from 'mongoose';
import { ProductRepository } from 'src/DATABASE/repository/product.repository';
import { BrandRepository } from 'src/DATABASE/repository/brand.repository';
import { CategoryRepository } from 'src/DATABASE/repository/category.repository';
import { AppHelper } from 'src/common/app-helper';
import { deleteFolderFromCloudinary, deleteMultiFromCloudinary, productsFolderPath, uploadMultiImagesToCloudinary, uploadToCloudinary } from 'src/common/utils/cloudinary';
import { IImage, IResponse, response } from 'src/common';
import { CreateProduct, getAllProducts, getProduct, UpdateProduct } from './entities';
import { Product } from 'src/DATABASE';
import { GetAllProductsDto } from './dto/get.products.dto';


@Injectable()
export class ProductService {

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly appHelper: AppHelper,

  ) { }


  // ================== Create New Product ================== 


  async createProduct(
    createProductDto: CreateProductDto,
    files: [Express.Multer.File],
    userId: Types.ObjectId): Promise<IResponse<CreateProduct>> {


    await this.appHelper.checkBrandAndCategory(createProductDto.brand, createProductDto.category)


    const [product] = await this.productRepository.create({
      data: [{
        ...createProductDto,
        createdBy: userId
      }]
    }) || [];


    if (!product) {
      throw new InternalServerErrorException("Fail To Create Product");
    }


    let images: IImage[] = await uploadMultiImagesToCloudinary(files, `E_Commerce/products/${product._id}/`) || [];


    if (!images.length) {
      throw new InternalServerErrorException("Fail To Upload Images")
    }

    const newProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: product._id },
      updateData: {
        images
      }
    })

    if (!newProduct) {
      this.productRepository.deleteOne({
        _id: product._id
      })
      throw new InternalServerErrorException("Fail To Create Product");
    }


    return response({
      data: { newProduct }
    });
  }


  // ================== Update Product ================== 


  async updateProduct(
    _id: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    files: [Express.Multer.File],
    userId: Types.ObjectId): Promise<IResponse<UpdateProduct>> {


    const issues: {
      path: string,
      info: string
    }[] = []

    const [product, brand, category] = await Promise.all([
      this.appHelper.checkProductExists(_id),
      updateProductDto.brand ? this.appHelper.checkBrandExists(updateProductDto.brand) : false,
      updateProductDto.category ? this.appHelper.checkCategoryExists(updateProductDto.category) : false
    ])

    if (!product) {
      issues.push({
        path: "productId",
        info: `Brand ID ${_id} Not Found`
      })
    };

    if (updateProductDto.brand && !brand) {
      issues.push({
        path: "brand",
        info: `Brand ID ${_id} Not Found`
      })
    };

    if (updateProductDto.category && !category) {
      issues.push({
        path: "category",
        info: `Category ID ${_id} Not Found`
      })
    };

    if (issues.length) {
      throw new NotFoundException({
        statusCode: 404,
        message: "Some related entities were Not Found",
        error: "Not Found",
        issues,
      });
    }

    let oldImages: string[] = product.images.map((image) => image.public_id)
    let images: IImage[] = [];

    if (files) {


      images = await uploadMultiImagesToCloudinary(files, `${productsFolderPath}/${_id}`) || [];

      if (!images.length) {
        throw new BadRequestException("Fail To Upload Images");
      }

    }

    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id },
      updateData: {
        ...updateProductDto,
        updatedBy: userId,
        images
      }
    })

    if (!updatedProduct) {
      deleteMultiFromCloudinary(oldImages);
      throw new BadRequestException("Fail to Update Product");
    }

    return response({
      data: { updatedProduct }
    });
  }


  // ================== Freeze Product ================== 


  async freezeProduct(_id: Types.ObjectId, userId: Types.ObjectId) {


    if (!await this.productRepository.findOne({
      filter: {
        _id
      }
    })) {
      throw new NotFoundException("Product Not Exists");
    }

    await this.productRepository.updateOne({
      _id
    }, {
      $set: {
        freezedAt: new Date(),
        freezedBy: userId,
      }
    });

    return response();
  }

  // ================== Restore Product ================== 

  async restoreProduct(_id: Types.ObjectId, userId: Types.ObjectId)
    : Promise<IResponse<getProduct>> {


    if (!await this.productRepository.findOne({
      filter: {
        _id,
        freezedAt: { $exists: true },
        freezedBy: { $exists: true },
      },
      pranoId: true
    })) {
      throw new NotFoundException("No Matched Product");
    }

    const product = await this.productRepository.findOneAndUpdate({
      filter: {
        _id
      }, updateData: {
        $set: {
          restoredAt: new Date(),
          restoredBy: userId
        },
        $unset: {
          freezedAt: true,
          freezedBy: true,
        }
      }, pranoId: true
    })

    if (!product) {
      throw new InternalServerErrorException("Fail To Restore Product");
    }

    return response({ data: { product } });
  }

  // =================== Remove Product =================== 

  async removeProduct(_id: Types.ObjectId)
    : Promise<IResponse> {

    const product = await this.productRepository.findOne({ filter: { _id } });

    if (!product) {
      throw new NotFoundException(`Product With Id : ${_id} Is Not Exists`);
    }

    try {

      await Promise.all([

        deleteFolderFromCloudinary(`${productsFolderPath}/${_id}`),

        this.productRepository.findOneAndDelete({
          filter: { _id }, pranoId: true
        })

      ]);

      return response();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed To Delete Product');
    }

  }

  // =================== Get All Products =================== 

  async getAllProducts(query: GetAllProductsDto, freezed?: Boolean): Promise<IResponse<getAllProducts>> {

    let filter = {
    };

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter = {
        $or: [
          { name: searchRegex },
          { slogan: searchRegex },
          { description: searchRegex },
        ],
      };
    }

    const result = await this.productRepository.find({
      filter: {
        ...filter,
        freezedAt: { $exists: !!freezed }
      },
      projection: {  },
      limit: query.limit,
      page: query.page,
      pranoId: !!freezed
    }) ;

    return response({
      data: {
        products: result.data,
        pagination:result.pagination
      }
    });
  }

  // ================== Get Product By Id ================== 

  async getOneProduct(_id: Types.ObjectId): Promise<IResponse<getProduct>> {

    const product = await this.productRepository.findOne({
      filter: { _id },
    })

    if (!product) {
      throw new NotFoundException(`Fail To Find Product Matches With Id : ${_id}`)
    }

    return response({
      data: { product }
    });
  }



}
