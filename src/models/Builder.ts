import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBuilder extends Document {
  eventId: mongoose.Types.ObjectId;
  publicId: string;
  connectionToken: string;
  name: string;
  role: string;
  stack: string;
  builderTitle: string;
  photoUrl?: string;
  cardUrl: string;
  imageKitFileId?: string;
  connectionCount: number;
  claimed: boolean;
  passwordHash?: string;
  github?: string;
  xHandle?: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BuilderSchema: Schema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    publicId: { type: String, required: true, unique: true, index: true },
    connectionToken: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    stack: { type: String, required: true },
    builderTitle: { type: String, required: true },
    photoUrl: { type: String },
    cardUrl: { type: String, required: true },
    imageKitFileId: { type: String },
    connectionCount: { type: Number, default: 0 },
    claimed: { type: Boolean, default: false },
    passwordHash: { type: String },
    github: { type: String },
    xHandle: { type: String },
    city: { type: String },
  },
  { timestamps: true }
);

// Indexes for high performance queries
BuilderSchema.index({ eventId: 1, connectionCount: -1 });
BuilderSchema.index({ eventId: 1, role: 1 });
BuilderSchema.index({ eventId: 1, stack: 1 });

export const Builder: Model<IBuilder> =
  mongoose.models.Builder || mongoose.model<IBuilder>("Builder", BuilderSchema);
export default Builder;
