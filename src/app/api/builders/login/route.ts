import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { Builder } from "@/models/Builder";
import { loginBuilderSchema } from "@/schemas/builder";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 1. Validate Request Body
    const body = await request.json();
    const result = loginBuilderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, passcode } = result.data;

    await connectToDatabase();

    // 2. Find Builders by name (case-insensitive)
    const builders = await Builder.find({
      name: { $regex: new RegExp("^" + name.trim() + "$", "i") },
    });

    if (builders.length === 0) {
      return NextResponse.json({ error: "No builder passport found with this name." }, { status: 404 });
    }

    // 3. Match the correct builder using passcode comparison
    let matchedBuilder = null;
    for (const b of builders) {
      if (b.claimed && b.passwordHash) {
        const isPinCorrect = await bcrypt.compare(passcode, b.passwordHash);
        if (isPinCorrect) {
          matchedBuilder = b;
          break;
        }
      }
    }

    if (!matchedBuilder) {
      const hasUnclaimed = builders.some((b) => !b.claimed);
      if (hasUnclaimed && builders.length === 1) {
        return NextResponse.json(
          { error: "This passport has not been secured with a passcode yet." },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "Invalid passcode. Please try again." }, { status: 401 });
    }

    const builder = matchedBuilder;

    // 5. Establish HTTP-Only JWT Cookie Session
    const payload = {
      builderId: (builder._id as any).toString(),
      publicId: builder.publicId,
    };
    await setSessionCookie(payload);

    return NextResponse.json({
      success: true,
      message: "Welcome back, builder!",
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
    console.error("Login recovery failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
