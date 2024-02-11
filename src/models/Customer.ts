import { Schema, model, Types } from 'mongoose';

export interface ICustomer {
  id: Types.ObjectId;
  stripeID: string;
  name: string;
  email: string,
  phone: string,
  billing: IAddress;
  orders: Array<Types.ObjectId>;
  timestamp: Date;
}

interface IAddress {
  line1: string;
  line2: string | undefined;
  postal_code: string;
  city: string;
  state: string | undefined;
  country: string;
}

const customerSchema = new Schema<ICustomer>(
  {
    stripeID: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    billing: {
      line1: {
        type: String,
        required: true
      },
      line2: {
        type: String,
        required: false
      },
      postal_code: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: false
      },
      country: {
        type: String,
        required: true
      },
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Order'
      }
    ],
    timestamp: {
      type: Date,
      required: true,
      default: () => Date.now()
    }
  }
);

export const Customer = model<ICustomer>('Customer', customerSchema);
