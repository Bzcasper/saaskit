// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

/**
 * Caching utility using Deno KV for API responses
 */

import { kv } from "@/utils/db.ts";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
}

/**
 * Generate a cache key from endpoint and parameters
 */
export function generateCacheKey(
  endpoint: string,
  params: Record<string, string | undefined>,
  prefix = "api",
): string {
  const sortedParams = Object.keys(params)
    .filter((key) => params[key] !== undefined)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join("|");

  return `${prefix}:${endpoint}:${sortedParams}`;
}

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const result = await kv.get([key]);
    if (result.value) {
      return result.value as T;
    }
  } catch (error) {
    console.warn("Cache get error:", error);
  }
  return null;
}

/**
 * Set cached data with TTL
 */
export async function setCached<T>(
  key: string,
  data: T,
  ttl = 600, // 10 minutes default
): Promise<void> {
  try {
    await kv.set([key], data, { expireIn: ttl });
  } catch (error) {
    console.warn("Cache set error:", error);
  }
}

/**
 * Delete cached data
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await kv.delete([key]);
  } catch (error) {
    console.warn("Cache delete error:", error);
  }
}

/**
 * Clear all cache entries with a prefix
 */
export async function clearCache(prefix: string): Promise<void> {
  try {
    const iter = kv.list({ prefix: [prefix] });
    for await (const entry of iter) {
      await kv.delete(entry.key);
    }
  } catch (error) {
    console.warn("Cache clear error:", error);
  }
}

/**
 * Get or set cache with a function
 */
export async function getOrSetCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = 600 } = options;

  // Try to get from cache
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Not in cache, execute function
  const data = await fn();

  // Cache the result
  await setCached(key, data, ttl);

  return data;
}
