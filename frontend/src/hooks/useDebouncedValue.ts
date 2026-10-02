"use client";

import { useEffect, useState } from "react";

/** Atrasa a propagação de um valor que muda rápido (ex.: campo de busca), pra não disparar uma requisição por tecla. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
