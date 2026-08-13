import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionPayload } from "@/lib/auth";
import { Builder } from "@/models/Builder";
import { Connection } from "@/models/Connection";

export async function GET() {
  try {
    const session = await getSessionPayload();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Fetch all connections where user is A or B
    const builderId = session.builderId;
    const connections = await Connection.find({
      $or: [{ userA: builderId }, { userB: builderId }],
    }).sort({ createdAt: -1 });

    // 2. Extract IDs of target builders
    const connectedIds = connections.map((conn) => {
      const uA = conn.userA.toString();
      return uA === builderId ? conn.userB.toString() : uA;
    });

    // 3. Fetch public profile information for all met builders
    const metBuilders = await Builder.find(
      { _id: { $in: connectedIds } },
      { name: 1, role: 1, stack: 1, builderTitle: 1, cardUrl: 1, publicId: 1, xHandle: 1, github: 1, city: 1 }
    );

    // Maintain connection date for rendering
    const idToDateMap = new Map<string, Date>();
    connections.forEach((conn) => {
      const targetId = conn.userA.toString() === builderId ? conn.userB.toString() : conn.userA.toString();
      idToDateMap.set(targetId, conn.createdAt);
    });

    const metList = metBuilders.map((b) => ({
      id: b._id,
      publicId: b.publicId,
      name: b.name,
      role: b.role,
      stack: b.stack,
      builderTitle: b.builderTitle,
      cardUrl: b.cardUrl,
      xHandle: b.xHandle,
      github: b.github,
      city: b.city,
      connectedAt: idToDateMap.get((b._id as any).toString()),
    }));

    // Sort by met date (most recent first)
    metList.sort((a, b) => (b.connectedAt?.getTime() || 0) - (a.connectedAt?.getTime() || 0));

    // 4. Calculate Stats
    const totalMet = metList.length;
    const uniqueRoles = new Set(metList.map((b) => b.role));
    const uniqueStacks = new Set(metList.map((b) => b.stack));

    // Simple robust diversity score out of 100
    // e.g. Roles = max 5 (worth 40%), Stacks = max 8 (worth 40%), Connections volume = max 10 (worth 20%)
    const rolesScore = Math.min(uniqueRoles.size * 8, 40); // Max 40
    const stacksScore = Math.min(uniqueStacks.size * 5, 40); // Max 40
    const connectionsScore = Math.min(totalMet * 2, 20); // Max 20
    const diversityScore = Math.round(rolesScore + stacksScore + connectionsScore);

    return NextResponse.json({
      success: true,
      stats: {
        totalMet,
        uniqueRoles: uniqueRoles.size,
        uniqueStacks: uniqueStacks.size,
        diversityScore,
      },
      peopleMet: metList,
    });
  } catch (error: any) {
    console.error("Fetch network stats failed:", error);
    return NextResponse.json({ error: "Failed to load network stats" }, { status: 500 });
  }
}
