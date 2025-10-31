import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Req, ValidationPipe, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FreezeProductParamDto, RestoreProductParamDto, UpdateProductDto, UpdateProductParamDto } from './dto/update-product.dto';
import { fileValidation, RoleEnum, SetAccessRoles, SetTokenType } from 'src/common';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { cloudFileUpload } from 'src/common/utils/multer/cloud.multer.options';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { IRequest, IResponse } from 'src/common';
import { Types } from 'mongoose';
import { CreateProduct, getAllProducts, getProduct, UpdateProduct } from './entities';
import { GetAllProductsDto, GetOneProductParamDto } from './dto/get.products.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  // ================== Create New Product ================== 


  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @UseInterceptors(FilesInterceptor("images",
    5,
    cloudFileUpload({
      validation: fileValidation.image
    })
  ))
  @Post("create")
  createProduct(
    @Req() req: IRequest,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          })
        ]
      })
    ) files: [Express.Multer.File]
  ): Promise<IResponse<CreateProduct>> {
    return this.productService.createProduct(createProductDto,
      files,
      req.credentials?.user._id as Types.ObjectId);
  }


  // ================== Update Product ================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @UseInterceptors(FilesInterceptor("images",
    5,
    cloudFileUpload({
      validation: fileValidation.image
    })
  ))
  @Patch("update/:productId")
  updateProduct(
    @Req() req: IRequest,
    @Param() param: UpdateProductParamDto,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: [Express.Multer.File]
  )
    : Promise<IResponse<UpdateProduct>> {
    return this.productService.updateProduct(
      param.productId,
      updateProductDto,
      files,
      req.credentials?.user._id as Types.ObjectId);
  }


  // ================== Freeze Product ================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('freeze/:productId')
  freezeCategory(
    @Param() param: FreezeProductParamDto,
    @Req() req: IRequest) {

    const _id = req.credentials?.user._id as unknown as Types.ObjectId;

    return this.productService.freezeProduct(param.productId, _id);

  }


  // ================== Restore Product ================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('restore/:productId')
  restoreProduct(
    @Param() param: RestoreProductParamDto,
    @Req() req: IRequest): Promise<IResponse<getProduct>> {

    const _id = req.credentials?.user._id as unknown as Types.ObjectId;

    return this.productService.restoreProduct(param.productId, _id);

  }
  // =================== Remove Product =================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('remove/:productId')
  removeProduct(
    @Param() param: RestoreProductParamDto,
  ): Promise<IResponse<getProduct>> {

    return this.productService.removeProduct(param.productId);

  }


  // =================== Get All Products =================== 

  @Get("all")
  getAllProducts(@Query() query: GetAllProductsDto): Promise<IResponse<getAllProducts>> {
    return this.productService.getAllProducts(query);
  }


  // ================== Get Freezed Products ================== 


  @Get("freezed")
  getAllFreezedProducts(@Query() query: GetAllProductsDto): Promise<IResponse<getAllProducts>> {
    return this.productService.getAllProducts(query, true);
  }


  // ================== Get Product By Id ================== 

  @Get(':productId')
  getOneBrand(@Param() param: GetOneProductParamDto): Promise<IResponse<getProduct>> {
    return this.productService.getOneProduct(param.productId);
  }

  

}
