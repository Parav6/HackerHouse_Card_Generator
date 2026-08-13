import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getOrCreateActiveEvent } from "@/models/Event";
import { Builder } from "@/models/Builder";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // 1. Try to fetch from Redis cache
    const cacheKey = "leaderboard:top-20";
    const cachedData = await redis.get<any[]>(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        leaderboard: cachedData,
        cached: true,
      });
    }

    // 2. Cache miss: connect to DB and run aggregation
    await connectToDatabase();
    const event = await getOrCreateActiveEvent();

    const topBuilders = await Builder.find(
      { eventId: event._id },
      { name: 1, role: 1, stack: 1, builderTitle: 1, cardUrl: 1, publicId: 1, connectionCount: 1 }
    )
      .sort({ connectionCount: -1, createdAt: 1 }) // Break ties by earliest creation
      .limit(20);

    // Map profiles into array
    const leaderboard = topBuilders.map((b, index) => ({
      rank: index + 1,
      id: b._id,
      publicId: b.publicId,
      name: b.name,
      role: b.role,
      stack: b.stack,
      builderTitle: b.builderTitle,
      cardUrl: b.cardUrl,
      connectionCount: b.connectionCount,
    }));

    // 3. Cache results in Redis for 10 seconds
    await redis.set(cacheKey, leaderboard, { ex: 10 });

    return NextResponse.json({
      success: true,
      leaderboard,
      cached: false,
    });
  } catch (error: any) {
    console.error("Leaderboard query failed:", error);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
