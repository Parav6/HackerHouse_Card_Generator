import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Builder } from "@/models/Builder";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await connectToDatabase();
    const builder = await Builder.findOne({ connectionToken: token });

    if (!builder) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      builder: {
        id: builder._id,
        publicId: builder.publicId,
        name: builder.name,
        role: builder.role,
        stack: builder.stack,
        builderTitle: builder.builderTitle,
        cardUrl: builder.cardUrl,
        connectionCount: builder.connectionCount,
        xHandle: builder.xHandle,
        github: builder.github,
        city: builder.city,
      },
    });
  } catch (error: any) {
    console.error("Fetch by token failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
