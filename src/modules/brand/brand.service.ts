import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from 'src/DATABASE/repository/brand.repository';
import { IRequest, IResponse, response } from 'src/common';
import { Types } from 'mongoose';
import { uploadToCloudinary } from 'src/common/utils/cloudinary';
import { CreateBrand } from './entities/brand.entity';
import { deleteFromCloudinary } from 'src/common/utils/cloudinary/cloudinary.delete';

@Injectable()
export class BrandService {

  constructor(private readonly brandRepository: BrandRepository) { }

  async createBrand(createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    userId: Types.ObjectId): Promise<IResponse<CreateBrand>> {

    if (await this.brandRepository.findOne({
      filter: {
        name: createBrandDto.name
      }
    })) {
      throw new BadRequestException("Brand Name Is Exists");
    }

    const cloudinaryFolder = `E_Commerce/brands/${createBrandDto.name}/`;

    const result = await uploadToCloudinary(file, cloudinaryFolder);

    try {
      const [brand] = await this.brandRepository.create({
        data: [{
          name: createBrandDto.name,
          slogan: createBrandDto.slogan,
          image: {
            url: result.secure_url,
            public_id: result.public_id,
          },
          createdBy: userId
        }]
      }) || []

      if (!brand) {
        await deleteFromCloudinary(result.public_id);
        throw new InternalServerErrorException("Fail To Create Brand");
      }

      return response({
        statusCode: 201,
        data: { brand }
      });


    } catch (error) {

      await deleteFromCloudinary(result.public_id);
      throw error

    }

  }

  findAll() {
    return `This action returns all brand`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    return `This action updates a #${id} brand`;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
