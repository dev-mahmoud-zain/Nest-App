import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, Req, ValidationPipe, UsePipes, BadRequestException, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto, GetAllBrandsQuery } from './dto';
import { UpdateBrandDto, UpdateBrandParamsDto } from './dto/update-brand.dto';
import { fileValidation, RoleEnum, SetAccessRoles, SetTokenType, StorageEnum } from 'src/common';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload } from 'src/common/utils/multer/cloud.multer.options';

import type { IRequest, IResponse } from 'src/common';
import { Types } from 'mongoose';
import { CreateBrand, GetAllBrands, GetOneBrand, RestoreBrand, UpdatedBrand } from './entities/brand.entity';
import { GetOneBrandDto } from './dto/get.one.brand.dto';

@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true
}))
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }


  // ================== Create New Brand ================== 


  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @UseInterceptors(FileInterceptor("image",
    cloudFileUpload({
      validation: fileValidation.image
    })
  ))
  @Post("create-brand")
  createBrand(
    @Req() req: IRequest,
    @Body(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })) createBrandDto: CreateBrandDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
          })
        ]
      })
    ) file: Express.Multer.File
  ): Promise<IResponse<CreateBrand>> {
    return this.brandService.createBrand(
      createBrandDto,
      file,
      req.credentials?.user._id as Types.ObjectId);
  }


  // =================== Update Brand =================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @UseInterceptors(FileInterceptor("image",
    cloudFileUpload({
      validation: fileValidation.image
    })
  ))
  @Patch("update-brand/:brandId")
  updateBrand(
    @Param() params: UpdateBrandParamsDto,
    @Req() req: IRequest,
    @Body(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })) updateBrandDto: UpdateBrandDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<IResponse<UpdatedBrand>> {

    if (!updateBrandDto && !file) {
      throw new BadRequestException('Please provide at least one field to update: name, slogan, or image')
    }

    return this.brandService.updateBrand(
      params.brandId,
      updateBrandDto,
      file,
      req.credentials?.user._id as Types.ObjectId);
  }

  // =================== Freeze Brand =================== 


  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('freeze-brand/:brandId')
  freezeBrand(
    @Param('brandId') brandId: Types.ObjectId,
    @Req() req: IRequest) {
    const _id = new Types.ObjectId(brandId);

    return this.brandService.freezeBrand(_id, req.credentials?.user.id);
  }


  // =================== Restore Brand =================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('restore-brand/:brandId')
  restoreFreezedBrand(
    @Param('brandId') brandId: Types.ObjectId,
    @Req() req: IRequest): Promise<IResponse<RestoreBrand>> {
    const _id = new Types.ObjectId(brandId);

    return this.brandService.restoreFreezedBrand(_id, req.credentials?.user.id);
  }


  // =================== Remove Brand =================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('remove-brand/:brandId')
  removeBrand(
    @Param('brandId') brandId: Types.ObjectId,
  ): Promise<IResponse<RestoreBrand>> {
    const _id = new Types.ObjectId(brandId);

    return this.brandService.removeBrand(_id);
  }


  // =================== Get All Brands =================== 


  @Get("all")
  getAllBrands(@Query() query: GetAllBrandsQuery): Promise<IResponse<GetAllBrands>> {
    return this.brandService.getAllBrands(query);
  }

  // =================== Get All Freezed =================== 


  @Get("all-freezed")
  getAllFreezed(@Query() query: GetAllBrandsQuery): Promise<IResponse<GetAllBrands>> {
    return this.brandService.getAllBrands(query,true);
  }

  // =================== Get Brand By Id =================== 


  @Get(':brandId')
  getOneBrand(@Param() param: GetOneBrandDto): Promise<IResponse<GetOneBrand>> {
    return this.brandService.getOneBrand(param.brandId);
  }



}
