import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, Req, ValidationPipe } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { fileValidation, RoleEnum, SetAccessRoles, SetTokenType, StorageEnum } from 'src/common';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload } from 'src/common/utils/multer/cloud.multer.options';

import type { IRequest } from 'src/common';
import { Types } from 'mongoose';


@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

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
  ) {
    return this.brandService.createBrand(
      createBrandDto,
      file,
      req.credentials?.user._id as Types.ObjectId);
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(+id, updateBrandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(+id);
  }
}
