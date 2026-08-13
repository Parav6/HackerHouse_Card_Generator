import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { getOrCreateActiveEvent } from "@/models/Event";
import { Builder } from "@/models/Builder";
import { createBuilderSchema } from "@/schemas/builder";
import { generateBuilderTitle } from "@/lib/builder-titles";
import { uploadToImageKit, deleteFromImageKit } from "@/lib/imagekit";
import { setSessionCookie, getSessionPayload } from "@/lib/auth";
import { Connection } from "@/models/Connection";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // 1. Rate Limit Card Creation (Disabled for testing)
    
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitKey = `rate-limit:builders-create:${ip}`;
    const limiter = await rateLimit(limitKey, 5, 3600); // 5 per hour
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many card generations. Please wait an hour." },
        { status: 429 }
      );
    }
    

    // 2. Validate Request Body
    const body = await request.json();
    const result = createBuilderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, role, stack, xHandle, github, city, cardImage, connectionToken: clientToken } = result.data;

    // 3. Connect to DB and Fetch Active Event
    await connectToDatabase();
    const event = await getOrCreateActiveEvent();

    // Clean up previous builder profile if session exists
    const session = await getSessionPayload();
    if (session && session.builderId) {
      try {
        const oldBuilder = await Builder.findById(session.builderId);
        if (oldBuilder) {
          // Fetch connections involving the old builder
          const oldConnections = await Connection.find({
            $or: [{ userA: oldBuilder._id }, { userB: oldBuilder._id }],
          });

          // Identify peer builders to update their connection counts
          const peerIds = oldConnections.map((conn) =>
            conn.userA.toString() === oldBuilder._id.toString() ? conn.userB : conn.userA
          );

          // Delete all old connections
          await Connection.deleteMany({
            $or: [{ userA: oldBuilder._id }, { userB: oldBuilder._id }],
          });

          // Decrement connection counts for peer builders
          if (peerIds.length > 0) {
            await Builder.updateMany(
              { _id: { $in: peerIds } },
              { $inc: { connectionCount: -1 } }
            );
          }

          // Delete old image from ImageKit
          if (oldBuilder.imageKitFileId) {
            await deleteFromImageKit(oldBuilder.imageKitFileId);
          }

          // Delete the old builder profile
          await Builder.deleteOne({ _id: oldBuilder._id });
        }
      } catch (cleanError) {
        console.error("Failed to clean up previous builder session:", cleanError);
      }
    }

    // 4. Generate Identifiers
    const randomSuffix = crypto.randomBytes(2).toString("hex"); // e.g. "9a2f"
    const slugifiedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const publicId = `${slugifiedName || "builder"}-${randomSuffix}`;
    const connectionToken = clientToken || crypto.randomBytes(16).toString("hex");

    // 5. Generate Builder Title
    const builderTitle = generateBuilderTitle(role, stack);

    // 6. Upload Generated Badge Image to ImageKit
    const fileName = `badge-${publicId}.png`;
    const uploadResult = await uploadToImageKit(cardImage, fileName);

    // 7. Save Builder to database
    const builder = new Builder({
      eventId: event._id,
      publicId,
      connectionToken,
      name,
      role,
      stack,
      builderTitle,
      cardUrl: uploadResult.url,
      imageKitFileId: uploadResult.fileId,
      connectionCount: 0,
      claimed: false,
      github,
      xHandle,
      city,
    });

    await builder.save();

    // 8. Set HTTP-Only JWT Session Cookie
    const payload = {
      builderId: (builder._id as any).toString(),
      publicId: builder.publicId,
    };
    await setSessionCookie(payload);

    return NextResponse.json(
      {
        success: true,
        builder: {
          id: builder._id,
          publicId: builder.publicId,
          name: builder.name,
          role: builder.role,
          stack: builder.stack,
          builderTitle: builder.builderTitle,
          cardUrl: builder.cardUrl,
          connectionToken: builder.connectionToken,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Builder creation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate Builder ID. Please try again." },
      { status: 500 }
    );
  }
}
