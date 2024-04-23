import { Schema, Types, model } from "mongoose";

export interface ICollection {
  id: Types.ObjectId;
  name: string;
  views: number;
  parent: Types.ObjectId;
}

const collectionSchema = new Schema<ICollection>({
  name: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
});

export const Collection = model<ICollection>("Collection", collectionSchema);
