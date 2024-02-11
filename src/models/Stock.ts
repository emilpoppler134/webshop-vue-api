import { Schema, model, Types } from 'mongoose';

export interface IStock {
  id: Types.ObjectId;
  product: Types.ObjectId;
  size: string;
  price: number;
  quantity: number;
}

const stockSchema = new Schema<IStock>(
  {
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    size: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }
);

export const Stock = model<IStock>('Stock', stockSchema);
