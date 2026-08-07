import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { assignmentQuery } from './api';

export function useBusinessResource<T>(path: string, initialValue: T) {
  const { assignment, request } = useAuth();
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!assignment) return;
    setLoading(true);
    setError(null);
    try {
      setData(
        await request<T>(
          `${path}?${assignmentQuery(assignment.id)}`,
        ),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  }, [assignment, path, request]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, setData, loading, error, refresh };
}
