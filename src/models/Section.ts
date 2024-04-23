import { Schema, model, Types } from "mongoose";

export interface ISection {
  id: Types.ObjectId;
  name: string;
  categories: Array<Types.ObjectId>;
  featured: Array<IFeatured>;
}

interface IFeatured {
  name: string;
  href: string;
  image: string;
  alt: string;
}

const sectionSchema = new Schema<ISection>({
  name: {
    type: String,
    required: true,
  },
  categories: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
  ],
  featured: [
    {
      name: {
        type: String,
        required: true,
      },
      href: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        required: true,
      },
    },
  ],
});

export const Section = model<ISection>("Section", sectionSchema);
