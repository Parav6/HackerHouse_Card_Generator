import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Builder } from "@/models/Builder";
import { Connection } from "@/models/Connection";
import { Event, getOrCreateActiveEvent } from "@/models/Event";

function verifyAdmin(request: Request): boolean {
  const secret = request.headers.get("x-admin-secret");
  const serverSecret = process.env.ADMIN_SECRET || "hh_goa_admin_secret_passcode_2026";
  return secret === serverSecret;
}

export async function GET(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const event = await getOrCreateActiveEvent();

    const builders = await Builder.find({ eventId: event._id }).sort({ createdAt: -1 });
    const connectionsCount = await Connection.countDocuments({ eventId: event._id });
    
    // Fetch last 15 connections with builder names
    const recentConnections = await Connection.find({ eventId: event._id })
      .sort({ createdAt: -1 })
      .limit(15);

    return NextResponse.json({
      success: true,
      event: {
        slug: event.slug,
        name: event.name,
        settings: event.settings,
      },
      stats: {
        totalBuilders: builders.length,
        totalConnections: connectionsCount,
      },
      builders: builders.map((b) => ({
        id: b._id,
        publicId: b.publicId,
        name: b.name,
        role: b.role,
        stack: b.stack,
        builderTitle: b.builderTitle,
        cardUrl: b.cardUrl,
        connectionCount: b.connectionCount,
        createdAt: b.createdAt,
      })),
      recentConnections,
    });
  } catch (error: any) {
    console.error("Admin GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    await connectToDatabase();
    const event = await getOrCreateActiveEvent();

    if (action === "toggle-feature") {
      const { feature, value } = body;
      const validFeatures = ["connectionsEnabled", "leaderboardEnabled", "networkEnabled"];
      
      if (!validFeatures.includes(feature)) {
        return NextResponse.json({ error: "Invalid feature target" }, { status: 400 });
      }

      await Event.updateOne(
        { _id: event._id },
        { $set: { [`settings.${feature}`]: !!value } }
      );

      return NextResponse.json({ success: true, message: `Updated setting: ${feature} to ${value}` });
    }

    if (action === "delete-builder") {
      const { builderId } = body;
      if (!builderId) {
        return NextResponse.json({ error: "Builder ID is required" }, { status: 400 });
      }

      // Delete connections involving this user
      await Connection.deleteMany({
        $or: [{ userA: builderId }, { userB: builderId }],
      });

      // Delete the builder profile
      await Builder.deleteOne({ _id: builderId });

      // Re-calculate connection counts for other builders who were connected
      // To keep simple: decrement count for builders connected, or let them update atomically.
      // Recalculating counts:
      const builders = await Builder.find();
      for (const b of builders) {
        const cCount = await Connection.countDocuments({
          $or: [{ userA: b._id }, { userB: b._id }],
        });
        await Builder.updateOne({ _id: b._id }, { $set: { connectionCount: cCount } });
      }

      return NextResponse.json({ success: true, message: "Builder and their connections deleted successfully." });
    }

    return NextResponse.json({ error: "Action not supported" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
