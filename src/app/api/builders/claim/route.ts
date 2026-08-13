import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionPayload } from "@/lib/auth";
import { Builder } from "@/models/Builder";
import { claimBuilderSchema } from "@/schemas/builder";

export async function POST(request: Request) {
  try {
    // 1. Resolve Session User
    const session = await getSessionPayload();
    if (!session) {
      return NextResponse.json({ error: "Authentication session required." }, { status: 401 });
    }

    // 2. Validate Request Body
    const body = await request.json();
    const result = claimBuilderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { passcode } = result.data;

    await connectToDatabase();

    // 3. Hash Passcode PIN
    const passwordHash = await bcrypt.hash(passcode, 10);

    // 4. Update Builder profile to claimed
    const builder = await Builder.findByIdAndUpdate(
      session.builderId,
      {
        $set: {
          passwordHash,
          claimed: true,
        },
      },
      { new: true }
    );

    if (!builder) {
      return NextResponse.json({ error: "Builder profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Passport successfully claimed and secured!",
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
      },
    });
  } catch (error: any) {
    console.error("Claim passport failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
