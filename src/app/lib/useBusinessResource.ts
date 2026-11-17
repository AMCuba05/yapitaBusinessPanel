import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { assignmentQuery } from './api';
import {
  businessResourceCacheKey,
  loadBusinessResource,
  readBusinessResourceCache,
  readStaleBusinessResourceCache,
} from './resourceCache';

export function useBusinessResource<T>(path: string, initialValue: T) {
  const { assignment, request } = useAuth();
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force: boolean) => {
    if (!assignment) {
      setLoading(false);
      return;
    }

    const cacheKey = businessResourceCacheKey(assignment.id, path);
    const fresh = force ? undefined : readBusinessResourceCache<T>(cacheKey);
    if (fresh !== undefined) {
      setData(fresh);
      setError(null);
      setLoading(false);
      return;
    }

    const cached = readStaleBusinessResourceCache<T>(cacheKey);
    if (cached !== undefined) setData(cached);

    setLoading(true);
    setError(null);
    try {
      setData(
        await loadBusinessResource(
          cacheKey,
          () => request<T>(`${path}?${assignmentQuery(assignment.id)}`),
          force,
        ),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  }, [assignment, path, request]);

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    void load(false);
  }, [load]);

  return { data, setData, loading, error, refresh };
}
