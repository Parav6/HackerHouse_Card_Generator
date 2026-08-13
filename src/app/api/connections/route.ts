import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionPayload } from "@/lib/auth";
import { Builder } from "@/models/Builder";
import { Connection } from "@/models/Connection";
import { getOrCreateActiveEvent } from "@/models/Event";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // 1. Resolve Session User
    const session = await getSessionPayload();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to connect with other builders." },
        { status: 401 }
      );
    }

    // 2. Rate Limit Connections (e.g. 20 connection scans per minute per session)
    const limitKey = `rate-limit:connections-create:${session.builderId}`;
    const limiter = await rateLimit(limitKey, 20, 60); // 20 per minute
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Connecting too fast. Please slow down." },
        { status: 429 }
      );
    }

    // 3. Parse and Validate Request Body
    const body = await request.json();
    const { connectionToken } = body;
    if (!connectionToken) {
      return NextResponse.json(
        { error: "Connection token is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 4. Resolve Target Builder
    const targetBuilder = await Builder.findOne({ connectionToken });
    if (!targetBuilder) {
      return NextResponse.json({ error: "Scanned builder profile not found." }, { status: 404 });
    }

    const initiatorId = session.builderId;
    const targetId = (targetBuilder._id as any).toString();

    // 5. Block Self Connections
    if (initiatorId === targetId) {
      return NextResponse.json({ error: "You cannot connect with yourself!" }, { status: 400 });
    }

    const event = await getOrCreateActiveEvent();

    // 6. Enforce Canonical Order of userA and userB (Lexicographical ObjectId string sort)
    const isInitiatorSmaller = initiatorId < targetId;
    const userAId = isInitiatorSmaller ? initiatorId : targetId;
    const userBId = isInitiatorSmaller ? targetId : initiatorId;

    // 7. Check if Connection Already Exists
    const existingConnection = await Connection.findOne({
      eventId: event._id,
      userA: userAId,
      userB: userBId,
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: `You are already connected with ${targetBuilder.name}!` },
        { status: 409 }
      );
    }

    // 8. Write Connection to Database
    const newConnection = new Connection({
      eventId: event._id,
      userA: userAId,
      userB: userBId,
    });

    await newConnection.save();

    // 9. Increment Connection Counts Atomically for Both Users
    await Builder.updateMany(
      { _id: { $in: [initiatorId, targetId] } },
      { $inc: { connectionCount: 1 } }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Connection established!",
        target: {
          name: targetBuilder.name,
          builderTitle: targetBuilder.builderTitle,
          role: targetBuilder.role,
          stack: targetBuilder.stack,
          cardUrl: targetBuilder.cardUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Connection creation failed:", error);
    return NextResponse.json({ error: "Failed to establish connection." }, { status: 500 });
  }
}
