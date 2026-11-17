export const BUSINESS_RESOURCE_CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  updatedAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

export function businessResourceCacheKey(assignmentId: string, path: string) {
  return `${assignmentId}:${path}`;
}

export function readBusinessResourceCache<T>(
  key: string,
  maxAgeMs = BUSINESS_RESOURCE_CACHE_TTL_MS,
): T | undefined {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.updatedAt >= maxAgeMs) return undefined;
  return entry.data as T;
}

export function readStaleBusinessResourceCache<T>(key: string): T | undefined {
  return cache.get(key)?.data as T | undefined;
}

export async function loadBusinessResource<T>(
  key: string,
  loader: () => Promise<T>,
  force = false,
): Promise<T> {
  if (!force) {
    const cached = readBusinessResourceCache<T>(key);
    if (cached !== undefined) return cached;
  }

  const pending = pendingRequests.get(key);
  if (pending) return pending as Promise<T>;

  const request = loader()
    .then((data) => {
      cache.set(key, { data, updatedAt: Date.now() });
      return data;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
}

export function invalidateBusinessResourceCache(assignmentId?: string) {
  if (!assignmentId) {
    cache.clear();
    return;
  }

  const prefix = `${assignmentId}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function clearBusinessResourceCacheForTests() {
  cache.clear();
  pendingRequests.clear();
}
