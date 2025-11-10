import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Types } from 'mongoose';
import {
  CartRepository,
  CouponDocument,
  CouponRepository,
  OrderProduct,
  ProductRepository,
} from 'src/DATABASE';
import { OrderRepository } from 'src/DATABASE/repository/order.repository';
import { randomUUID } from 'node:crypto';
import {
  CouponEnum,
  IUser,
  OrderStatusEnum,
  PaymentService,
  PaymentTypeEnum,
  response,
} from 'src/common';
import dayjs from 'dayjs';
import { Request } from 'express';
import { RealTimeGateWay } from '../gateway';

@Injectable()
export class OrderService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
    private readonly couponRepository: CouponRepository,
    private readonly paymentService: PaymentService,
    private readonly realTimeGateWay: RealTimeGateWay,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: Types.ObjectId) {
    const cart = await this.cartRepository.findOne({
      filter: {
        createdBy: userId,
      },
    });

    if (!cart || !cart.products.length) {
      throw new BadRequestException('Cart Is Empty');
    }

    const outOfStock: Types.ObjectId[] = [];
    const lessThanOrderQuantity: {
      productId: Types.ObjectId;
      stock: number;
      orderQuantity: number;
    }[] = [];
    const products: OrderProduct[] = [];

    for (const product of cart.products) {
      const p = await this.productRepository.findOne({
        filter: {
          _id: product.productId,
        },
      });

      if (!p) {
        throw new BadRequestException(
          `Fail To Find Product ${product.productId}`,
        );
      }

      if (p.stock === 0) {
        outOfStock.push(p._id);
        continue;
      }

      if (p.stock < product.quantity) {
        lessThanOrderQuantity.push({
          productId: p._id,
          stock: p.stock,
          orderQuantity: product.quantity,
        });

        continue;
      }

      const images = p.images.map((image) => {
        return image.url;
      });

      products.push({
        name: p.name,
        productId: p._id,
        quantity: product.quantity,
        unitPrice: p.salePrice,
        totalPrice: p.salePrice * product.quantity,
        description: p.description,
        images,
      });
    }

    if (outOfStock.length || lessThanOrderQuantity.length) {
      throw new BadRequestException({
        message: 'Some products are not available in the required quantity',
        outOfStock: outOfStock.length ? outOfStock : undefined,
        lessThanOrderQuantity: lessThanOrderQuantity.length
          ? lessThanOrderQuantity
          : undefined,
      });
    }

    let subtotal: number = 0;

    for (const product of products) {
      subtotal += product.totalPrice;
    }

    let coupon: CouponDocument | null = null;

    if (createOrderDto.coupon) {
      coupon = (await this.couponRepository.findOne({
        filter: {
          couponId: createOrderDto.coupon,
        },
      })) as CouponDocument;

      if (!coupon) {
        throw new BadRequestException('Fail To Find Matched Coupon');
      }

      const now = dayjs();

      if (dayjs(coupon.startDate).isAfter(now, 'day')) {
        throw new BadRequestException(
          'The start date of this coupon is not yet valid.',
        );
      }

      if (dayjs(coupon.endDate).isBefore(now, 'day')) {
        throw new BadRequestException('This coupon has expired.');
      }

      if (coupon.duration === coupon.usedBy?.length) {
        throw new BadRequestException(
          'This coupon has reached its usage limit.',
        );
      }
    }

    let discount: number = 0;

    if (coupon) {
      switch (coupon.type) {
        case CouponEnum.amount:
          discount = subtotal - coupon.discount;
          break;

        case CouponEnum.percentage:
          discount = subtotal * (coupon.discount / 100);
          break;
        default:
          discount = 0;
          break;
      }
    }

    const [order] =
      (await this.orderRepository.create({
        data: [
          {
            ...createOrderDto,
            createdBy: new Types.ObjectId(userId),
            orderId: randomUUID().slice(0, 8),
            products,
            subtotal,
            discount,
            coupon: coupon !== null ? coupon._id : undefined,
          },
        ],
      })) || [];

    if (!order) {
      throw new InternalServerErrorException('Fail To Crate Order');
    }

    const updatedProductsStock: { productId: Types.ObjectId; stock: Number }[] =
      [];

    for (const product of products) {
      
      const result = await this.productRepository.findOneAndUpdate({
        filter: {
          _id: product.productId,
        },
        updateData: { $inc: { stock: -product.quantity } },
      });

      updatedProductsStock.push({
        productId: result?._id as Types.ObjectId,
        stock: result?.stock as Number,
      });
    }

    this.realTimeGateWay.changeProductStock(updatedProductsStock);

    this.cartRepository.deleteOne({
      createdBy: userId,
    });

    if (coupon) {
      this.couponRepository.updateOne(
        {
          _id: coupon._id,
        },
        {
          $addToSet: {
            usedBy: userId,
          },
        },
      );
    }

    return response({
      statusCode: 201,
      data: order,
    });
  }

  async checkout(orderId: Types.ObjectId, user: IUser) {
    const order = await this.orderRepository.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        status: OrderStatusEnum.pending,
        paymentType: PaymentTypeEnum.card,
      },
    });

    if (!order) {
      throw new BadRequestException('Fail To Find Matched Order');
    }

    const session = await this.paymentService.checkoutSession({
      customer_email: user.email,
      metadata: { orderId: orderId.toString() },
      line_items: order.products.map((product) => {
        return {
          quantity: product.quantity,
          price_data: {
            currency: 'egp',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.images,
            },
            unit_amount: product.unitPrice * 100,
          },
        };
      }),
    });

    const paymentMethod = await this.paymentService.createPaymentMethod({
      type: 'card',
      card: {
        token: 'tok_visa',
      },
    });

    const intent = await this.paymentService.createPaymentIntent({
      amount: order.finalTotal * 100,
      currency: 'egp',
      payment_method: paymentMethod.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    order.paymentIntent = intent.id;
    order.save();

    return response({
      data: {
        id: session.id,
        url: session.url,
        expires_at: new Date(session.expires_at * 1000).toISOString(),
        customer_email: session.customer_email,
      },
    });
  }

  async webhook(req: Request) {
    const event = await this.paymentService.webHook(req);

    const { orderId } = event.data.object.metadata as {
      orderId: string;
    };

    const orderPaid = await this.orderRepository.findOneAndUpdate({
      filter: {
        _id: orderId,
        status: OrderStatusEnum.pending,
        paymentType: PaymentTypeEnum.card,
      },
      updateData: {
        status: OrderStatusEnum.placed,
      },
    });

    if (!orderPaid) {
      throw new BadRequestException('Fail To Pay Order');
    }

    const confirmedIntent = await this.paymentService.confirmPaymentIntent(
      orderPaid.paymentIntent,
    );

    return;
  }

  async cancelOrder(orderId: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this.orderRepository.findOne({
      filter: {
        _id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException(`Fail To Found Order With Id : ${orderId}`);
    }

    if (order.createdBy.toString() !== userId.toString()) {
      throw new BadRequestException(
        'You are not authorized to access this order',
      );
    }

    if (order.status === OrderStatusEnum.canceled) {
      throw new BadRequestException(`Your Order Already Canceled Before`);
    }

    if (
      ![OrderStatusEnum.pending, OrderStatusEnum.placed].includes(order.status)
    ) {
      throw new BadRequestException(
        `Your order is currently '${order.status}'. It cannot be canceled at this stage.`,
      );
    }

    await Promise.all([
      this.orderRepository.updateOne(
        { _id: orderId },
        { status: OrderStatusEnum.canceled },
      ),

      ...order.products.map((product) =>
        this.productRepository.updateOne(
          { _id: product.productId },
          { $inc: { stock: product.quantity } },
        ),
      ),
    ]);

    if (order.paymentIntent) {
      const refund = await this.paymentService.refund(order.paymentIntent);
      if (refund) {
        return response({
          message: 'Refund processed successfully',
          data: {
            refundId: refund.id,
            paymentIntentId: refund.payment_intent,
            amount: refund.amount / 100,
            currency: refund.currency.toUpperCase(),
            status: refund.status,
            createdAt: new Date(refund.created * 1000).toISOString(),
            destination: refund.destination_details?.type,
            referenceStatus: refund.destination_details?.card?.reference_status,
          },
        });
      }
    }

    return;
  }
}
