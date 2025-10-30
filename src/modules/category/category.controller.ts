import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Req, ValidationPipe, UploadedFile, ParseFilePipe, MaxFileSizeValidator, BadRequestException, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto, UpdateCategoryParamsDto } from './dto/update-category.dto';
import { fileValidation, RoleEnum, SetAccessRoles, SetTokenType } from 'src/common';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload } from 'src/common/utils/multer/cloud.multer.options';
import type { IRequest, IResponse } from 'src/common';
import { Types } from 'mongoose';
import { CreateCategory, GetAllCategories, GetOneCategory, RestoreCategory, UpdatedCategory } from './entities/category.entity';
import { GetAllCategoriesQuery, GetOneCategoryDto } from './dto';





@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  // ================== Create New Category ================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @UseInterceptors(FileInterceptor("image",
    cloudFileUpload({
      validation: fileValidation.image
    })
  ))
  @Post("create")
  createCategory(
    @Req() req: IRequest,
    @Body(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })) createCategoryDto: CreateCategoryDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          })
        ]
      })
    ) file: Express.Multer.File
  ): Promise<IResponse<CreateCategory>> {

    return this.categoryService.createCategory(
      createCategoryDto,
      file,
      req.credentials?.user._id as Types.ObjectId);
  }


  // =================== Update Category =================== 


  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @UseInterceptors(FileInterceptor("image",
    cloudFileUpload({
      validation: fileValidation.image
    })
  ))
  @Patch("update/:categoryId")
  updateCategory(
    @Param() params: UpdateCategoryParamsDto,
    @Req() req: IRequest,
    @Body(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })) updateCategoryData: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File
  )
    : Promise<IResponse<UpdatedCategory>> {

    if (!updateCategoryData && !file) {
      throw new BadRequestException('Please provide at least one field to update: name, description , categorys, or image')
    }

    return this.categoryService.updateCategory(
      params.categoryId,
      updateCategoryData,
      file,
      req.credentials?.user._id as Types.ObjectId);
  }


  // =================== Freeze Category =================== 



  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('freeze/:categoryId')
  freezeCategory(
    @Param('categoryId') categoryId: Types.ObjectId,
    @Req() req: IRequest) {
    const _id = new Types.ObjectId(categoryId);
    return this.categoryService.freezeCategory(_id, req.credentials?.user.id);
  }

  // =================== Restore Category =================== 

  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('restore/:categoryId')
  restoreFreezedcategory(
    @Param('categoryId') categoryId: Types.ObjectId,
    @Req() req: IRequest): Promise<IResponse<RestoreCategory>> {
    const _id = new Types.ObjectId(categoryId);

    return this.categoryService.restoreCategory(_id, req.credentials?.user.id);
  }

  // =================== Remove Category =================== 



  @SetTokenType(TokenTypeEnum.access)
  @SetAccessRoles([RoleEnum.super_admin, RoleEnum.admin])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('remove/:categoryId')
  removeCategory(
    @Param('categoryId') categoryId: Types.ObjectId,
  ): Promise<IResponse> {
    const _id = new Types.ObjectId(categoryId);

    return this.categoryService.removeCategory(_id);
  }

  // =================== Get All Categories =================== 

  @Get("all")
  getAllCategories(@Query() query: GetAllCategoriesQuery): Promise<IResponse<GetAllCategories>> {
    return this.categoryService.getAllCategories(query);
  }

  // =================== Get All Freezed =================== 


  @Get("all-freezed")
  getAllFreezed(@Query() query: GetAllCategoriesQuery): Promise<IResponse<GetAllCategories>> {
    return this.categoryService.getAllCategories(query, true);
  }

    // =================== Get Category By Id =================== 

  @Get(':categoryId')
  getOneBrand(@Param() param: GetOneCategoryDto): Promise<IResponse<GetOneCategory>> {
    return this.categoryService.getOneCategory(param.categoryId);
  }

}
