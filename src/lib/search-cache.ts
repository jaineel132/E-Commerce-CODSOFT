import { Redis } from '@upstash/redis'
import crypto from 'crypto'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CACHE_TTL = 300

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ')
}

function hashQuery(query: string): string {
  return crypto.createHash('md5').update(query).digest('hex')
}

function cacheKey(query: string): string {
  return `search:${hashQuery(normalizeQuery(query))}`
}

export async function getCachedSearch(query: string): Promise<{ products: unknown[] } | null> {
  const key = cacheKey(query)
  const cached = await redis.get<{ products: unknown[] }>(key)
  if (cached) {
    console.log(`[CACHE HIT] search - "${normalizeQuery(query)}"`)
    return cached
  }
  console.log(`[CACHE MISS] search - "${normalizeQuery(query)}"`)
  return null
}

export async function setCachedSearch(query: string, data: { products: unknown[] }): Promise<void> {
  const key = cacheKey(query)
  await redis.set(key, data, { ex: CACHE_TTL })
  console.log(`[CACHE STORE] search - "${normalizeQuery(query)}" (TTL ${CACHE_TTL}s)`)
}
