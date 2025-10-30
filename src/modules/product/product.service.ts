import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Types } from 'mongoose';
import { ProductRepository } from 'src/DATABASE/repository/product.repository';
import { BrandRepository } from 'src/DATABASE/repository/brand.repository';
import { CategoryRepository } from 'src/DATABASE/repository/category.repository';
import { AppHelper } from 'src/common/app-helper';
import { deleteMultiFromCloudinary, productsFolderPath, uploadMultiImagesToCloudinary, uploadToCloudinary } from 'src/common/utils/cloudinary';
import { IImage, IResponse, response } from 'src/common';
import { CreateProduct, UpdateProduct } from './entities';
import { Product } from 'src/DATABASE';


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




  // ================== Restore Product ================== 




  // ================== Restore Product ================== 




  // =================== Remove Product =================== 



  // =================== Get Products =================== 




  // ================== Get Freezed Products ================== 




  // ================== Get Freezed Products ================== 




  // ================== Get Product By Id ================== 


}
