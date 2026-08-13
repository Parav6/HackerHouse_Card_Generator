import { redis } from "./redis";

/**
 * Basic rate limiting helper using Redis.
 * Runs on a fixed-window duration.
 *
 * @param key Unique key to identify the caller (e.g. rate-limit:api-name:ip)
 * @param limit Maximum allowed hits
 * @param durationSeconds Expiry window for the key
 */
export async function rateLimit(
  key: string,
  limit: number,
  durationSeconds: number
): Promise<{ success: boolean; current: number; limit: number }> {
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.set(key, 1, { ex: durationSeconds });
    }
    return {
      success: current <= limit,
      current,
      limit,
    };
  } catch (error) {
    console.error("Rate limiter error: ", error);
    // Graceful fallback to allow request through if Redis fails
    return { success: true, current: 1, limit };
  }
}
