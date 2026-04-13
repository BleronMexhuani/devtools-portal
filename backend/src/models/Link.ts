import mongoose, { Document, Schema } from 'mongoose';

export interface ILink extends Document {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILink>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    url: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    icon: { type: String, trim: true, maxlength: 100 },
    category: { type: String, trim: true, maxlength: 100 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

linkSchema.index({ category: 1, sortOrder: 1 });

export const Link = mongoose.model<ILink>('Link', linkSchema);
