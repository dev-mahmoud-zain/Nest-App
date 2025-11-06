import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AddToCartCartParamDto } from './dto/create-cart.dto';
import { CartRepository, ProductRepository } from 'src/DATABASE';
import { response } from 'src/common';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { AppHelper } from 'src/common/app-helper';

@Injectable()
export class CartService {


  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
    private readonly appHelper: AppHelper,

  ) { }

  // ================== Add To Cart ================== 


  async addToCart(AddToCartCartParamDto: AddToCartCartParamDto, userId: Types.ObjectId) {

    const { productId, quantity } = AddToCartCartParamDto

    const [product, cart] = await Promise.all([

      this.productRepository.findOne({
        filter: { _id: productId }
      }),

      this.cartRepository.findOne({
        filter: { createdBy: userId }
      }),

    ]);

    if (!product) {
      throw new NotFoundException(`Product With Id: ${productId} Not Exits`);
    };


    if (!cart) {

      const [cart] = await this.cartRepository.create({
        data: [{
          createdBy: userId,
          products: [{ productId: new Types.ObjectId(productId), quantity }]
        }]
      }) || []


      if (!cart) {
        throw new InternalServerErrorException("Fail To Add Product To Cart");
      };

      return response({
        statusCode: 201,
        data: { cart: cart }
      })


    }

    const productInCart = cart.products.find((product) => {
      return product.productId.toString() === productId.toString()
    });

    if (productInCart) {
      productInCart.quantity += quantity;
    } else {

      cart.products.push({
        productId: new Types.ObjectId(productId),
        quantity
      });

    }

    await cart.save();

    return response({
      statusCode: 200,
      data: { cart }
    })

  }


  // ================== Remove From Cart ================== 

  async removeFromCart(removeFromCart: RemoveFromCartDto, userId: Types.ObjectId) {

    const { products } = removeFromCart;

    const cart = await this.cartRepository.findOne({
      filter: {
        createdBy: userId
      }
    });

    if (!cart || cart && !cart.products.length) {
      throw new BadRequestException("Your Cart Is Empty");
    }



    this.appHelper.checkDuplicates(products, "Product Id's")

    const notInCart = products.filter(id => !cart.products.some(p => p.productId.toString() === id.toString()))

    if (notInCart.length) {
      throw new BadRequestException({
        statusCode: 400,
        message: "Some Products Are Not In The Cart",
        error: "Bad Request",
        details: {
          notInCart
        },
      });
    }


    const updatedCart = await this.cartRepository.findOneAndUpdate({
      filter: {
        createdBy: userId
      },
      updateData: {
        $pull: {
          products: {
            productId: { $in: products.map(id => new Types.ObjectId(id)) }
          }
        }
      }
    })



    return response({
      data: { updatedCart }
    })

  }


  // ================== Clear Cart ================== 


  async clearCart(userId: Types.ObjectId) {

    const cart = await this.cartRepository.findOne({
      filter: { createdBy: userId }
    })

    if (!cart || !cart.products.length) {
      throw new BadRequestException("Cart Is Empty");
    };


    cart.products = [];

    cart.save();

    return response({
      statusCode: 200
    })


  }

  // ================== Get Cart ================== 


  async getCart(userId: Types.ObjectId) {

    const cart = await this.cartRepository.findOne({
      filter: { createdBy: userId }
    })

    if (!cart || !cart.products.length) {
      throw new BadRequestException("Cart Is Empty");
    }

    return response({
      statusCode: 200,
      data: { cart }
    })


  }

}