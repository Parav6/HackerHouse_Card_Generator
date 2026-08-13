import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionPayload } from "@/lib/auth";
import { Builder } from "@/models/Builder";
import { Connection } from "@/models/Connection";

// Deterministic map of complementary roles
const COMPLEMENTARY_ROLES: Record<string, string[]> = {
  Frontend: ["Backend", "AI/ML", "Blockchain", "Founder", "Product Manager"],
  Design: ["Backend", "Fullstack", "Founder", "AI/ML", "Mobile"],
  Backend: ["Frontend", "Design", "Founder", "Mobile", "Product Manager"],
  "AI/ML": ["Frontend", "Design", "Founder", "Product Manager", "Mobile"],
  Blockchain: ["Frontend", "Founder", "Design", "Product Manager"],
  Founder: ["Fullstack", "Backend", "AI/ML", "Design", "Mobile"],
  Fullstack: ["Founder", "AI/ML", "Design", "Product Manager"],
  Mobile: ["Backend", "Founder", "Design", "AI/ML"],
  "Product Manager": ["Founder", "Fullstack", "AI/ML", "Design", "Blockchain"],
};

export async function GET() {
  try {
    const session = await getSessionPayload();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const builderId = session.builderId;
    const currentBuilder = await Builder.findById(builderId);
    if (!currentBuilder) {
      return NextResponse.json({ error: "Builder profile not found" }, { status: 404 });
    }

    // 1. Fetch connected user IDs to exclude
    const connections = await Connection.find({
      $or: [{ userA: builderId }, { userB: builderId }],
    });

    const excludedIds = new Set<string>();
    excludedIds.add(builderId); // Exclude self
    connections.forEach((conn) => {
      excludedIds.add(
        conn.userA.toString() === builderId ? conn.userB.toString() : conn.userA.toString()
      );
    });

    const excludeList = Array.from(excludedIds);

    // 2. Determine preferred complementary roles
    const targetRoles = COMPLEMENTARY_ROLES[currentBuilder.role] || [];

    // 3. Search for complementary builders
    let recommended = await Builder.find(
      {
        _id: { $nin: excludeList },
        eventId: currentBuilder.eventId,
        role: { $in: targetRoles },
      },
      { name: 1, role: 1, stack: 1, builderTitle: 1, cardUrl: 1, publicId: 1, city: 1 }
    ).limit(3);

    // 4. Fallback if we didn't find enough matches: search for ANY met builders not in the list
    if (recommended.length < 3) {
      const needed = 3 - recommended.length;
      const alreadyFoundIds = recommended.map((b) => (b._id as any).toString());
      const fallbackExcludes = [...excludeList, ...alreadyFoundIds];

      const fallbacks = await Builder.find(
        {
          _id: { $nin: fallbackExcludes },
          eventId: currentBuilder.eventId,
        },
        { name: 1, role: 1, stack: 1, builderTitle: 1, cardUrl: 1, publicId: 1, city: 1 }
      ).limit(needed);

      recommended = [...recommended, ...fallbacks];
    }

    return NextResponse.json({
      success: true,
      recommendations: recommended,
    });
  } catch (error: any) {
    console.error("Recommendations lookup failed:", error);
    return NextResponse.json({ error: "Failed to load recommendations" }, { status: 500 });
  }
}
