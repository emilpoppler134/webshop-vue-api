import Stripe from 'stripe';
import { Types } from 'mongoose';

import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { Stock } from '../models/Stock.js';
import { STRIPE_SECRET_KEY } from '../config.js';

import type { ICustomer } from '../models/Customer.js';
import type { IOrder } from '../models/Order.js';
import type { Request, Response } from 'express';

interface IOrderInsertParams extends Omit<IOrder, 'id'|'timestamp'> {}
interface ICustomerInsertParams extends Omit<ICustomer, 'id'|'timestamp'> {}

interface IParams {
  products: Array<string>;
  promotionCode: string | undefined;
  customer: ICustomerParams;
  shipping: IShippingParams;
  payment: ICardParams;
}

interface ICustomerParams {
  name: string;
  email: string;
  phone: string;
  billing: IAddressParams;
}

interface IAddressParams {
  line1: string;
  line2: string | undefined;
  postal_code: string;
  city: string;
  state: string | undefined;
  country: string;
}

interface IShippingParams {
  name: string;
  phone: string;
  address: IAddressParams;
}

interface ICardParams {
  cc_name: string;
  cc_number: string;
  exp_month: string;
  exp_year: string;
  cc_csc: string;
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

async function charge(req: Request, res: Response) {
  const purchaseContext: IParams = req.body;
  const payment: ICardParams = purchaseContext.payment;
  const customer: ICustomerParams = purchaseContext.customer;
  const shipping: IShippingParams = purchaseContext.shipping;

  let amount = 99;

  let stripeCustomerID: string | undefined = undefined;
  let stripeChargeID: string | undefined = undefined;

  for (let i = 0; i < purchaseContext.products.length; i++) {
    const item = purchaseContext.products[i];

    if (item === undefined || !Types.ObjectId.isValid(item)) {
      res.json({status: "ERROR", error: "Not a valid product ID"});
      return;
    }
    
    const product = await Stock.findById(item)
      .populate({path: 'product', model: 'Product'});

    if (product === null) {
      res.json({status: "ERROR", error: "Product doesn't exist"});
      return;
    }

    if (product.quantity === 0) {
      res.json({status: "ERROR", error: "Product is soldout"});
      return;
    }

    amount += product.price;
  }

  try {
    const century: number = Math.round(new Date().getFullYear() / 1000) * 1000;
    const exp_year: string = (century + parseInt(payment.exp_year)).toString();

    const stripeTokenCreateParams: Stripe.TokenCreateParams = {
      card: {
        name: payment.cc_name,
        number: payment.cc_number,
        exp_month: payment.exp_month,
        exp_year: exp_year,
        cvc: payment.cc_csc,
        currency: 'sek'
      }
    };
    const stripeTokenResponse = await stripe.tokens.create(stripeTokenCreateParams);

    const stripeCustomerCreateParams: Stripe.CustomerCreateParams = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: {
        line1: customer.billing.line1,
        line2: customer.billing.line2,
        postal_code: customer.billing.postal_code,
        city: customer.billing.city,
        state: undefined,
        country: customer.billing.country
      },
      shipping: {
        address: {
          line1: shipping.address.line1,
          line2: shipping.address.line2,
          postal_code: shipping.address.postal_code,
          city: shipping.address.city,
          state: undefined,
          country: shipping.address.country
        },
        name: shipping.name,
        phone: shipping.phone
      },
      source: stripeTokenResponse.id
    }
    const stripeCustomerResponse = await stripe.customers.create(stripeCustomerCreateParams);

    const stripeChargeCreateParams: Stripe.ChargeCreateParams = {
      amount: amount * 100,
      currency: 'sek',
      source: stripeCustomerResponse.default_source?.toString() || undefined,
      customer: stripeCustomerResponse.id,
      receipt_email: stripeCustomerResponse.email || undefined,
      shipping: {
        address: {
          line1: shipping.address.line1,
          line2: shipping.address.line2,
          postal_code: shipping.address.postal_code,
          city: shipping.address.city,
          state: undefined,
          country: shipping.address.country
        },
        name: shipping.name,
        phone: shipping.phone
      }
    }
    const stripeChargeResponse = await stripe.charges.create(stripeChargeCreateParams);

    stripeCustomerID = stripeCustomerResponse.id;
    stripeChargeID = stripeChargeResponse.id;

  } catch(err) {
    res.json({status: "ERROR", error: err});
    return;
  }

  try {
    for (let i = 0; i < purchaseContext.products.length; i++) {
      const item = purchaseContext.products[i];
      await Stock.findByIdAndUpdate(item, { $inc: { quantity: -1 } })
    }

    const customerCreateParams: ICustomerInsertParams = {
      stripeID: stripeCustomerID,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      billing: customer.billing,
      orders: []
    }
    const createCustomerResponse = await Customer.create(customerCreateParams);

    const orderCreateParams: IOrderInsertParams = {
      stripeID: stripeChargeID,
      customer: createCustomerResponse.id,
      email: customer.email,
      amount,
      line_items: purchaseContext.products.map(item => new Types.ObjectId(item)),
      shipping
    }
    await Order.create(orderCreateParams);

    res.json({status: "OK"});
  } catch(err) {
    res.json({status: "ERROR", error: err});
    return;
  }
}

export default { charge }