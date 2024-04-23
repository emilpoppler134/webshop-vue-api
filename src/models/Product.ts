import { Schema, model, Types } from "mongoose";

export interface IProduct {
  id: Types.ObjectId;
  name: string;
  articleNumber: number;
  stock: Array<Types.ObjectId>;
  image: IImage;
  collections: Array<Types.ObjectId>;
  views: number;
  timestamp: Date;
}

interface IImage {
  key: string;
  type: string;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  articleNumber: {
    type: Number,
    required: true,
  },
  stock: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Stock",
    },
  ],
  image: {
    key: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  collections: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Collection",
    },
  ],
  views: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

export const Product = model<IProduct>("Product", productSchema);
