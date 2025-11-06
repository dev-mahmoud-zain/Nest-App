import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { addToWishlistDto } from './dto/add-to-wishlist.dto';
import { Types } from 'mongoose';
import { WishlistRepository } from 'src/DATABASE/repository/wishlist.repository';
import { ProductRepository } from 'src/DATABASE';
import { response } from 'src/common';

@Injectable()
export class WishlistService {

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository
  ) { }


  async addToWishlist(productId: Types.ObjectId, userId: Types.ObjectId) {

    const [product, wishlist] = await Promise.all([

      this.productRepository.findOne({
        filter: { _id: productId }
      }),

      this.wishlistRepository.findOne({
        filter: { createdBy: userId }
      }),

    ]);

    if (!product) {
      throw new NotFoundException(`Product With Id: ${productId} Not Exits`);
    };

    if (!wishlist) {

      const [wishlist] = await this.wishlistRepository.create({
        data: [{
          createdBy: userId,
          products: [{ productId: new Types.ObjectId(productId) }]
        }]
      }) || []


      if (!wishlist) {
        throw new InternalServerErrorException("Fail To Add Product To Wishlist");
      };


      return response({
        statusCode: 201,
        data: { cart: wishlist }
      })

    };

    if (wishlist.products.find((p) => p.productId.toString() === productId.toString())) {
      throw new BadRequestException("This Product Already In Your Wishlist");
    };

    wishlist.products.push({
      productId
    });

    wishlist.save();

    return response({
      statusCode: 201,
      data: { wishlist }
    })


  }


  async removeFromWishlist(productId: Types.ObjectId, userId: Types.ObjectId) {

    const [product, wishlist] = await Promise.all([

      this.productRepository.findOne({
        filter: { _id: productId }
      }),

      this.wishlistRepository.findOne({
        filter: { createdBy: userId }
      }),

    ]);

    if (!product) {
      throw new NotFoundException(`Product With Id: ${productId} Not Exits`);
    };

    if (!wishlist || !wishlist.products.find((p) => p.productId.toString() === productId.toString())) {
      throw new BadRequestException("This Product Not In Your Wishlist");
    };

    const updated = await this.wishlistRepository.findOneAndUpdate({
      filter: {
        _id: wishlist._id
      },
      updateData: {
        $pull: {
          products: {
            productId
          }
        }
      }
    })

    return response({
      statusCode: 200,
      data: { wishlist: updated }
    })


  }


  async getWishlist(userId: Types.ObjectId) {

    const wishlist = await this.wishlistRepository.findOne({
      filter: { createdBy: userId }
    })

    if (!wishlist || !wishlist.products.length) {
      throw new BadRequestException("Wishlist Is Empty");
    }

    return response({
      statusCode: 200,
      data: { wishlist }
    })


  }


  async clearWishlist(userId: Types.ObjectId) {

    const wishlist = await this.wishlistRepository.findOne({
      filter: { createdBy: userId }
    })

    if (!wishlist || !wishlist.products.length) {
      throw new BadRequestException("Wishlist Is Empty");
    };


    wishlist.products = [];

    wishlist.save();

    return response({
      statusCode: 200
    })


  }


}
