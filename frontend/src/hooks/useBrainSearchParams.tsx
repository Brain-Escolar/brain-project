"use client";
import { useSearchParams } from "next/navigation";

/**
 * Hook para facilitar a obtenção de parâmetros da URL
 * @param paramName - Nome do parâmetro a ser buscado na URL
 * @returns O valor do parâmetro ou null se não existir
 */
export function useBrainSearchParams(paramName: string): string | null {
  const searchParams = useSearchParams();
  return searchParams.get(paramName);
}
