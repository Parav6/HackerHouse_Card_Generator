import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionPayload } from "@/lib/auth";
import { Builder } from "@/models/Builder";

export async function GET() {
  try {
    const session = await getSessionPayload();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    await connectToDatabase();
    const builder = await Builder.findById(session.builderId);
    if (!builder) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      builder: {
        id: builder._id,
        publicId: builder.publicId,
        name: builder.name,
        role: builder.role,
        stack: builder.stack,
        builderTitle: builder.builderTitle,
        cardUrl: builder.cardUrl,
        claimed: builder.claimed,
        xHandle: builder.xHandle,
        github: builder.github,
        city: builder.city,
        connectionCount: builder.connectionCount,
        connectionToken: builder.connectionToken,
      },
    });
  } catch (error: any) {
    console.error("Session lookup failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
