import { status } from "@grpc/grpc-js";
import Redis from "ioredis";
import { logger } from "../../utils";
import type { GrpcServerInterceptor, GrpcCall, GrpcCallback, GrpcHandler } from "../server-utils";

export class RateLimiterInterceptor implements GrpcServerInterceptor {
  private redis: Redis;

  constructor(
    redisUrl: string = "redis://localhost:6379",
    private limit: number = 100, // requests
    private window: number = 60 // seconds
  ) {
    this.redis = new Redis(redisUrl);
    this.redis.on("error", (err) => {
      logger.error(`[RateLimiter] Redis client error: ${err.message}`);
    });
  }

  async intercept(call: GrpcCall, callback: GrpcCallback, next: GrpcHandler, _context: any): Promise<void> {
    const apiKey = (call.metadata.get("x-api-key")[0] as string) || "anonymous";
    const key = `rate_limit:${apiKey}`;

    const allowed = await this.checkLimit(key);
    
    if (!allowed) {
      logger.warn(`[RateLimiter] Limit exceeded for ${apiKey}`);
      callback({
        code: status.RESOURCE_EXHAUSTED,
        details: "Rate limit exceeded"
      }, null);
      return; 
    }
    
    await next(call, callback);
  }

  private async checkLimit(key: string): Promise<boolean> {
    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, this.window);
      }
      return current <= this.limit;
    } catch (error: any) {
      logger.error(`[RateLimiter] Redis command failed`, error);
      return true; // Fail open
    }
  }
}
