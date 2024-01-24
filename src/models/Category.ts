import { Schema, model, Types } from 'mongoose';

export interface ICategory {
  id: Types.ObjectId;
  name: string,
  parent: Types.ObjectId,
  collections: Array<Types.ObjectId>
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true
    },
    parent: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Section'
    },
    collections: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Collection'
      }
    ]
  }
);

export const Category = model<ICategory>('Category', categorySchema);
