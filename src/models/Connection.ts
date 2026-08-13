import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConnection extends Document {
  eventId: mongoose.Types.ObjectId;
  userA: mongoose.Types.ObjectId; // Lexicographically smaller Builder ID
  userB: mongoose.Types.ObjectId; // Lexicographically larger Builder ID
  createdAt: Date;
}

const ConnectionSchema: Schema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userA: { type: Schema.Types.ObjectId, ref: "Builder", required: true },
    userB: { type: Schema.Types.ObjectId, ref: "Builder", required: true },
  },
  { timestamps: true }
);

// Unique compound index to prevent duplicate relationships
ConnectionSchema.index({ eventId: 1, userA: 1, userB: 1 }, { unique: true });
// Recent connections lookup
ConnectionSchema.index({ eventId: 1, createdAt: -1 });

export const Connection: Model<IConnection> =
  mongoose.models.Connection || mongoose.model<IConnection>("Connection", ConnectionSchema);
export default Connection;
