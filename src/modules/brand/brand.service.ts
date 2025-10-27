import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from 'src/DATABASE/repository/brand.repository';
import { IRequest, IResponse, response } from 'src/common';
import { Types } from 'mongoose';
import { brandsFolderPath, uploadToCloudinary } from 'src/common/utils/cloudinary';
import { CreateBrand, GetAllBrands, GetOneBrand, RestoreBrand, UpdatedBrand } from './entities/brand.entity';
import { deleteFolderFromCloudinary, deleteImageFromCloudinary } from 'src/common/utils/cloudinary/cloudinary.delete';
import { Brand } from 'src/DATABASE';
import { GetAllBrandsQuery } from './dto';

@Injectable()
export class BrandService {

  constructor(private readonly brandRepository: BrandRepository) { }

  async createBrand(createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    userId: Types.ObjectId): Promise<IResponse<CreateBrand>> {

    const brandWithSameName = await this.brandRepository.findOne({
      filter: {
        name: createBrandDto.name
      }, pranoId: true
    })

    if (brandWithSameName?.freezedAt
    ) {
      throw new ConflictException(`This Name '${createBrandDto.name}' Is Already Exists With Freezed Account`);
    }

    if (brandWithSameName && !brandWithSameName?.freezedAt
    ) {
      throw new ConflictException(`This Name '${createBrandDto.name}' Is Already Exists`);
    }



    const [brand] = await this.brandRepository.create({
      data: [{
        name: createBrandDto.name,
        slogan: createBrandDto.slogan,
        createdBy: userId,
      }]
    }) || []

    if (!brand) {
      throw new BadRequestException("Fail To Create Brand");
    }

    const cloudinaryFolder = `${brandsFolderPath}/${brand._id}/`;

    const result = await uploadToCloudinary(file, cloudinaryFolder);

    if (!result) {
      await this.brandRepository.deleteOne({
        _id: brand._id
      })
      throw new BadRequestException("Fail To Create Brand , Cannot Upload Image")
    }

    const newBrand = await this.brandRepository.updateOne({
      _id: brand._id
    },
      {
        image: {
          public_id: result.public_id,
          url: result.url
        }
      }
    )


    if (!newBrand.modifiedCount) {
      throw new InternalServerErrorException("Fail To Create Brand")
    }

    return response({
      statusCode: 201,
      data: {
        newBrand: {
          ...brand.toObject(),
          image: {
            public_id: result.public_id,
            url: result.url
          }
        }
      }
    });


  }


  async updateBrand(
    brandId: Types.ObjectId,
    updatedData: UpdateBrandDto,
    file: Express.Multer.File,
    userId: Types.ObjectId): Promise<IResponse<UpdatedBrand>> {


    const brand = await this.brandRepository.findOne({
      filter: {
        _id: brandId
      }
    })

    if (!brand) {
      throw new NotFoundException("Brand Not Exists");
    }


    // نتأكد ان الاسم مش موجود عند براند تاني
    if (updatedData.name) {

      const brandWithSameName = await this.brandRepository.findOne({
        filter: {
          name: updatedData.name
        }, pranoId: true
      });

      if (brandWithSameName?.freezedAt && !brandWithSameName._id.equals(brand._id)
      ) {
        throw new ConflictException(`This Name '${updatedData.name}' Is Already Exists With Another Freezed Account`);
      }

      if (brandWithSameName && !brandWithSameName._id.equals(brand._id)) {
        throw new ConflictException(`This Name '${updatedData.name}' Is Already Exists`);
      }




    }

    // نتأكد ان اليوزر مش باعت نفس الداتا القديمة
    let duplicatedData: { path: string, value: string }[] = []

    if (updatedData.name === brand.name) {
      duplicatedData.push({ path: "name", value: updatedData.name })
    }

    if (updatedData.slogan === brand.slogan
    ) {
      duplicatedData.push({ path: "slogan", value: updatedData.slogan })
    }

    if (duplicatedData.length) {
      throw new BadRequestException({
        statusCode: 400,
        message: "Some New Data Are Duplicated With Old Data",
        error: "Bad Request",
        duplicatedData
      });
    }


    // لو فيه صورة نرفعها
    let image: { url: string, public_id: string } = brand.image;
    if (file) {
      const cloudinaryFolder = `E_Commerce/brands/${brandId}/`;

      const result = await uploadToCloudinary(file, cloudinaryFolder);

      if (!result) {
        throw new InternalServerErrorException("Fail To Update Brand , Image Upload Failed");
      }

      image = {
        url: result.url,
        public_id: result.public_id
      }
    }

    const updatedBrand = await this.brandRepository.findOneAndUpdate({
      filter: {
        _id: brandId,
      }, updateData: {
        updatedBy: userId,
        image,
        ...updatedData
      }
    })

    if (!updatedBrand) {
      throw new InternalServerErrorException("Fail To Update Brand In Database")
    }

    if (!updatedBrand) {
      throw new InternalServerErrorException("Fail To Update Brand In Database");
    }

    if (file) {
      deleteImageFromCloudinary(brand.image.public_id);
    }

    return response({
      data: { updatedBrand }
    });

  }


  async freezeBrand(_id: Types.ObjectId, userId: Types.ObjectId) {

    if (!await this.brandRepository.findOne({
      filter: {
        _id
      }
    })) {
      throw new NotFoundException("Brand Not Exists");
    }

    await this.brandRepository.updateOne({
      _id
    }, {
      $set: {
        freezedAt: new Date(),
        freezedBy: userId
      }
    });

    return response();
  }


  async restoreFreezedBrand(_id: Types.ObjectId, userId: Types.ObjectId)
    : Promise<IResponse<RestoreBrand>> {

    if (!await this.brandRepository.findOne({
      filter: {
        _id,
        freezedAt: { $exists: true },
        freezedBy: { $exists: true },
      },
      pranoId: true
    })) {
      throw new NotFoundException("No Matched Brand");
    }

    const restoredBrand = await this.brandRepository.findOneAndUpdate({
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

    if (!restoredBrand) {
      throw new InternalServerErrorException("Fail To Restore Brand");
    }

    return response({ data: { restoredBrand } });
  }



  async removeBrand(_id: Types.ObjectId)
    : Promise<IResponse> {

    const brand = await this.brandRepository.findOne({
      filter: { _id },
      pranoId: true
    });


    if (!brand) {
      throw new NotFoundException("Brand Not Found");
    }


    await Promise.all([

      this.brandRepository.deleteOne({
        filter: { _id },
        pranoId: true
      }),

      deleteFolderFromCloudinary(`${brandsFolderPath}/${_id}`)

    ])



    return response();
  }



  async getAllBrands(query: GetAllBrandsQuery, freezed?: Boolean): Promise<IResponse<GetAllBrands>> {

    let filter = {
    };

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter = {
        $or: [
          { name: searchRegex },
          { slogan: searchRegex },
          { slug: searchRegex },
        ],
      };
    }

    const result = await this.brandRepository.find({
      filter: {
        ...filter,
        freezedAt: { $exists: !!freezed }
      },
      projection: { name: 1, slogan: 1, image: 1, slug: 1 },
      limit: query.limit,
      page: query.page,
      pranoId: !!freezed
    })

    return response({
      data: {
        brands: result.data,
        pagination: result.pagination
      }
    });
  }

  async getOneBrand(_id: Types.ObjectId): Promise<IResponse<GetOneBrand>> {

    const brand = await this.brandRepository.findOne({
      filter: { _id },
      select: { name: 1, slogan: 1, image: 1, slug: 1 }
    })

    if (!brand) {
      throw new NotFoundException(`Fail To Find Brand Matches With Id : ${_id}`)
    }

    return response({
      data: { brand }
    });
  }

}
