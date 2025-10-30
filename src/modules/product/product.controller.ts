import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Req, ValidationPipe, UploadedFiles, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductParamDto } from './dto/update-product.dto';
import { fileValidation, RoleEnum, SetAccessRoles, SetTokenType } from 'src/common';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { cloudFileUpload } from 'src/common/utils/multer/cloud.multer.options';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { IRequest, IResponse } from 'src/common';
import { Types } from 'mongoose';
import { CreateProduct, UpdateProduct } from './entities';

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
  @Post("update/:productId")
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




  // ================== Restore Product ================== 




  // ================== Restore Product ================== 




  // =================== Remove Product =================== 



  // =================== Get Products =================== 




  // ================== Get Freezed Products ================== 




  // ================== Get Freezed Products ================== 




  // ================== Get Product By Id ================== 



}
