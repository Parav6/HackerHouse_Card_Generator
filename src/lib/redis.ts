import { Redis } from "@upstash/redis";

// In-memory mock Redis for local development when keys are missing
class MockRedis {
  private store: Map<string, string> = new Map();
  private expiries: Map<string, number> = new Map();

  constructor() {
    console.warn("⚠️ Warning: Upstash Redis keys are missing. Using in-memory mock Redis.");
  }

  private isExpired(key: string): boolean {
    const expireAt = this.expiries.get(key);
    if (expireAt && Date.now() > expireAt) {
      this.store.delete(key);
      this.expiries.delete(key);
      return true;
    }
    return false;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (this.isExpired(key)) return null;
    const value = this.store.get(key);
    if (value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<"OK"> {
    const valStr = typeof value === "string" ? value : JSON.stringify(value);
    this.store.set(key, valStr);
    if (options?.ex) {
      this.expiries.set(key, Date.now() + options.ex * 1000);
    }
    return "OK";
  }

  async incr(key: string): Promise<number> {
    if (this.isExpired(key)) {
      this.store.delete(key);
    }
    const current = Number(this.store.get(key) || 0);
    const newVal = current + 1;
    this.store.set(key, String(newVal));
    return newVal;
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key) ? 1 : 0;
    this.store.delete(key);
    this.expiries.delete(key);
    return existed;
  }
}

const useMock = !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = useMock
  ? (new MockRedis() as unknown as Redis)
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    });
