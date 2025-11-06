import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async checkoutSession({
    customer_email,
    cancel_url = process.env.PAYMENT_CANCEL_URL as string,
    success_url = process.env.PAYMENT_SUCCESS_URL as string,
    metadata = {},
    discounts = [],
    mode = 'payment',
    line_items,
  }: Stripe.Checkout.SessionCreateParams): Promise<
    Stripe.Response<Stripe.Checkout.Session>
  > {
    const session = await this.stripe.checkout.sessions.create({
      customer_email,
      cancel_url,
      success_url,
      metadata,
      discounts,
      mode,
      line_items,
    });

    return session;
  }

  async webHook(req: Request): Promise<Stripe.CheckoutSessionCompletedEvent> {
    let event: Stripe.Event = this.stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );

    if (event.type !== 'checkout.session.completed') {
      throw new BadRequestException('Payment Operation Failed');
    }

    return event;
  }

  async createPaymentMethod(
    data: Stripe.PaymentMethodCreateParams,
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    return await this.stripe.paymentMethods.create(data);
  }

  async createPaymentIntent(
    data: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.create(data);
  }

  async retrievePaymentIntent(
    paymentId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.retrieve(paymentId);
  }

  async confirmPaymentIntent(
    paymentId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const intent = await this.retrievePaymentIntent(paymentId);

    if (!intent) {
      throw new BadRequestException('Fail To Find  Intent');
    }

    if (intent.status === 'succeeded') {
      throw new BadRequestException('This Intent Already Confirmed');
    }

    return this.stripe.paymentIntents.confirm(paymentId);
  }

  async refund(paymentId: string): Promise<Stripe.Response<Stripe.Refund>> {
    const intent = await this.retrievePaymentIntent(paymentId);

    if (!intent) {
      throw new BadRequestException('Fail To Find Intent');
    }

    if (intent.status !== 'succeeded') {
      throw new BadRequestException(
        'This payment is not completed yet, refund not possible.',
      );
    }

    return this.stripe.refunds.create({ payment_intent: intent.id });
  }
}