import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const getRedis = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

const redis = getRedis()

const noopLimiter = {
  limit: async () => ({ success: true }),
}

export const ipLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit:ip',
    })
  : noopLimiter

export const userLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit:user',
    })
  : noopLimiter

export async function checkUserRateLimit(userId: string): Promise<Response | null> {
  const { success } = await userLimiter.limit(userId)
  if (!success) {
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }
  return null
}
