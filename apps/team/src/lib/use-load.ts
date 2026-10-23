import { errorMessage } from "@aapka/shared";
import { useCallback, useEffect, useRef, useState } from "react";

import { readCache, writeCache } from "./cache";

export function useLoad<T>(key: string, load: () => Promise<T>) {
  const [data, setDataState] = useState<T | null>(() => readCache<T>(key) ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => readCache<T>(key) === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const loadRef = useRef(load);
  const latest = useRef(0);

  useEffect(() => {
    loadRef.current = load;
  });

  const run = useCallback(
    () => {
      const id = ++latest.current;
      return loadRef
        .current()
        .then((next) => {
          if (id !== latest.current) return;
          writeCache(key, next);
          setDataState(next);
          setError(null);
        })
        .catch((e: unknown) => {
          if (id === latest.current) setError(errorMessage(e));
        })
        .finally(() => {
          if (id !== latest.current) return;
          setLoading(false);
          setRefreshing(false);
        });
    },
    [key],
  );

  useEffect(() => {
    void run();
  }, [run]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    return run();
  }, [run]);

  return { data, error, loading, refreshing, refresh, reload: run };
}
