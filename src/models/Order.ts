import { Schema, model, Types } from "mongoose";

export interface IOrder {
  id: Types.ObjectId;
  stripeID: string;
  customer: Types.ObjectId;
  email: string;
  amount: Number;
  line_items: Array<Types.ObjectId>;
  shipping: IShipping;
  timestamp: Date;
}

interface IShipping {
  name: string;
  phone: string;
  address: IAddress;
}

interface IAddress {
  line1: string;
  line2: string | undefined;
  postal_code: string;
  city: string;
  state: string | undefined;
  country: string;
}

const orderSchema = new Schema<IOrder>({
  stripeID: {
    type: String,
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  email: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  line_items: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Stock",
    },
  ],
  shipping: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      line1: {
        type: String,
        required: true,
      },
      line2: {
        type: String,
        required: false,
      },
      postal_code: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: true,
      },
    },
  },
  timestamp: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
});

export const Order = model<IOrder>("Order", orderSchema);
