"use client";

import { useEffect, useState } from "react";

/** Current time, refreshed every `intervalMs` (aligned to the next tick). */
export function useNow(initial: number, intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date(initial));
  useEffect(() => {
    setNow(new Date());
    let timer: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(() => {
      setNow(new Date());
      timer = setInterval(() => setNow(new Date()), intervalMs);
    }, intervalMs - (Date.now() % intervalMs));
    return () => {
      clearTimeout(align);
      if (timer) clearInterval(timer);
    };
  }, [intervalMs]);
  return now;
}
