import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';
import { IResponse, response } from 'src/common';
import { BrandRepository } from 'src/DATABASE/repository/brand.repository';
import { CategoryRepository } from 'src/DATABASE/repository/category.repository';
import { categoriesFolderPath, deleteFolderFromCloudinary, deleteImageFromCloudinary, uploadToCloudinary } from 'src/common/utils/cloudinary';
import { CreateCategory, GetAllCategories, GetOneCategory, RestoreCategory, UpdatedCategory } from './entities/category.entity';
import { AppHelper } from 'src/common/app-helper';
import { GetAllCategoriesQuery } from './dto';

@Injectable()
export class CategoryService {

  constructor(

    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly appHelper: AppHelper,


  ) { }



  // ================== Create New Category ================== 

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    userId: Types.ObjectId): Promise<IResponse<CreateCategory>> {

    const { name, description, brands } = createCategoryDto;


    const [categoryWithSameName, brandsData] = await Promise.all([
      this.categoryRepository.findOne({
        filter: { name },
        pranoId: true
      }),
      brands?.length
        ? this.brandRepository.find({ filter: { _id: { $in: brands } } })
        : Promise.resolve({ data: [] })
    ]);


    if (categoryWithSameName?.freezedAt
    ) {
      throw new ConflictException(`This Name '${createCategoryDto.name}' Is Already Exists With Freezed Category`);
    };

    if (categoryWithSameName && !categoryWithSameName?.freezedAt
    ) {
      throw new ConflictException(`This Name '${createCategoryDto.name}' Is Already Exists`);
    };


    if (brands) {
      this.appHelper.checkBrands(brands, brandsData.data);
    };


    const [category] = await this.categoryRepository.create({
      data: [{
        name,
        description,
        brands,
        createdBy: userId
      }]
    }) || [];

    if (!category) {
      throw new InternalServerErrorException("Fail To Create Category");
    };


    const cloudinaryFolder = `${categoriesFolderPath}/${category._id}/`;
    const result = await uploadToCloudinary(file, cloudinaryFolder);

    if (!result) {
      await this.brandRepository.deleteOne({
        _id: category._id
      })
      throw new BadRequestException("Fail To Create Brand , Cannot Upload Image")
    };

    const newCategory = await this.categoryRepository.updateOne({
      _id: category._id
    },
      {
        image: {
          public_id: result.public_id,
          url: result.url
        }
      }
    )

    if (!newCategory.modifiedCount) {
      throw new InternalServerErrorException("Fail To Create Brand")
    }

    return response({
      statusCode: 201,
      data: {
        newCategory: {
          ...category.toObject(),
          image: {
            public_id: result.public_id,
            url: result.url
          }
        }
      }
    });

  }

  // =================== Update Category =================== 

  async updateCategory(
    categoryId: Types.ObjectId,
    updateCategoryData: UpdateCategoryDto,
    file: Express.Multer.File,
    userId: Types.ObjectId)
    : Promise<IResponse<UpdatedCategory>> {


    const category = await this.categoryRepository.findOne({
      filter: {
        _id: categoryId
      }
    });
    if (!category) {
      throw new NotFoundException("Category Not Exists");
    };


    if (updateCategoryData.name) {

      const categoryWithSameName = await this.categoryRepository.findOne({
        filter: {
          name: updateCategoryData.name
        }, pranoId: true
      });

      if (categoryWithSameName?.freezedAt && !categoryWithSameName._id.equals(category._id)
      ) {
        throw new ConflictException(`This Name '${updateCategoryData.name}' Is Already Exists With Another Freezed Account`);
      }
      if (categoryWithSameName && !categoryWithSameName._id.equals(category._id)) {
        throw new ConflictException(`This Name '${updateCategoryData.name}' Is Already Exists`);
      }

    };

    let duplicatedData: { path: string, value: string | string[] }[] = [];

    if (updateCategoryData.name === category.name) {
      duplicatedData.push({ path: "name", value: updateCategoryData.name })
    };

    if (updateCategoryData.description === category.description
    ) {
      duplicatedData.push({ path: "description", value: updateCategoryData.description })
    };

    if (updateCategoryData.brands) {

      const brandsData = await this.brandRepository.find({
        filter: {
          _id: { $in: updateCategoryData.brands }
        }
      });

      this.appHelper.checkBrands(updateCategoryData.brands, brandsData.data);

      const { brands: ids } = updateCategoryData;

      const brandsExits = category.brands ?? [];

      const existingIds = brandsExits.map(b =>
        typeof b === "object" ? b._id?.toString?.() ?? b.toString() : b.toString()
      );

      const incomingIds = ids.map(id => id.toString());

      const duplicates = incomingIds.filter(id => existingIds.includes(id));

      if (duplicates.length) {
        duplicatedData.push({ path: "brands", value: duplicates })
      }

    }


    if (duplicatedData.length) {
      throw new BadRequestException({
        statusCode: 400,
        message: "Some New Data Are Duplicated With Old Data",
        error: "Bad Request",
        duplicatedData
      });
    };


    let image: { url: string, public_id: string } = category.image;

    if (file) {
      const cloudinaryFolder = `E_Commerce/brands/${categoryId}/`;

      const result = await uploadToCloudinary(file, cloudinaryFolder);

      if (!result) {
        throw new InternalServerErrorException("Fail To Update Brand , Image Upload Failed");
      }

      image = {
        url: result.url,
        public_id: result.public_id
      }
    };

    const updatedCategory = await this.categoryRepository.findOneAndUpdate({
      filter: {
        _id: categoryId,
      }, updateData: {
        updatedBy: userId,
        image,
        ...updateCategoryData
      }
    });

    if (!updatedCategory) {
      throw new InternalServerErrorException("Fail To Update Brand In Database")
    };

    if (file) {
      deleteImageFromCloudinary(category.image.public_id);
    }

    return response({
      data: { updatedCategory }
    });

  }


  // =================== Freeze Category =================== 


  async freezeCategory(_id: Types.ObjectId, userId: Types.ObjectId) {

    if (!await this.categoryRepository.findOne({
      filter: {
        _id
      }
    })) {
      throw new NotFoundException("Category Not Exists");
    }

    await this.categoryRepository.updateOne({
      _id
    }, {
      $set: {
        freezedAt: new Date(),
        freezedBy: userId,
      }
    });

    return response();
  }

  // =================== Restore Category =================== 

  async restoreCategory(_id: Types.ObjectId, userId: Types.ObjectId)
    : Promise<IResponse<RestoreCategory>> {

    if (!await this.categoryRepository.findOne({
      filter: {
        _id,
        freezedAt: { $exists: true },
        freezedBy: { $exists: true },
      },
      pranoId: true
    })) {
      throw new NotFoundException("No Matched Category");
    }

    const restoredCategory = await this.categoryRepository.findOneAndUpdate({
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

    if (!restoredCategory) {
      throw new InternalServerErrorException("Fail To Restore Category");
    }

    return response({ data: { restoredCategory } });
  }

  // =================== Remove Category =================== 


  async removeCategory(_id: Types.ObjectId)
    : Promise<IResponse> {

    const category = await this.categoryRepository.findOne({
      filter: { _id },
      pranoId: true
    });


    if (!category) {
      throw new NotFoundException("Category Not Found");
    }

    try {

      await Promise.all([

        deleteFolderFromCloudinary(`${categoriesFolderPath}/${_id}`),

        this.categoryRepository.deleteOne({
          filter: { _id },
          pranoId: true
        }),

      ]);

      return response();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed To Delete Category');
    }


  }

  // =================== Get All Categories =================== 

  async getAllCategories(query: GetAllCategoriesQuery, freezed?: Boolean): Promise<IResponse<GetAllCategories>> {

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

    const result = await this.categoryRepository.find({
      filter: {
        ...filter,
        freezedAt: { $exists: !!freezed }
      },
      projection: { name: 1, slogan: 1, image: 1, slug: 1 },
      limit: query.limit,
      page: query.page,
      pranoId: !!freezed
    });

    return response({
      data: {
        categories: result.data,
        pagination: result.pagination
      }
    });
  }

  // =================== Get Category By Id =================== 


  async getOneCategory(_id: Types.ObjectId): Promise<IResponse<GetOneCategory>> {

    const category = await this.categoryRepository.findOne({
      filter: { _id },
      select: { name: 1, slogan: 1, image: 1, slug: 1 }
    })

    if (!category) {
      throw new NotFoundException(`Fail To Find Category Matches With Id : ${_id}`)
    }

    return response({
      data: { category }
    });
  }



}