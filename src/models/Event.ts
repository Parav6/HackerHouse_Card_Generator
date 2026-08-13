import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  slug: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  settings: {
    connectionsEnabled: boolean;
    leaderboardEnabled: boolean;
    networkEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    settings: {
      connectionsEnabled: { type: Boolean, default: true },
      leaderboardEnabled: { type: Boolean, default: true },
      networkEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

/**
 * Seeding helper to ensure at least one active event exists in the database.
 */
export async function getOrCreateActiveEvent(): Promise<IEvent> {
  const existing = await Event.findOne({ slug: "hh-goa-2026" });
  if (existing) return existing;

  const newEvent = new Event({
    slug: "hh-goa-2026",
    name: "Hacker House Goa 2026",
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-02-15"),
    isActive: true,
    settings: {
      connectionsEnabled: true,
      leaderboardEnabled: true,
      networkEnabled: true,
    },
  });

  return await newEvent.save();
}
