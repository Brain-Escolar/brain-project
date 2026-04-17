"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";

interface BreadcrumbContextType {
  overrideLabel: string | null;
  setOverrideLabel: (label: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [overrideLabel, setOverrideLabelState] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOverrideLabelState(null);
  }, [pathname]);

  const setOverrideLabel = useCallback((label: string | null) => {
    setOverrideLabelState(label);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ overrideLabel, setOverrideLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbContext() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumbContext must be used within a BreadcrumbProvider");
  }
  return ctx;
}

/**
 * Permite que uma página dinâmica sobrescreva o último crumb
 * (por exemplo, com o nome da entidade carregada).
 *
 * @example
 *   useBreadcrumbOverride(aluno?.nome);
 */
export function useBreadcrumbOverride(label: string | null | undefined) {
  const { setOverrideLabel } = useBreadcrumbContext();

  useEffect(() => {
    setOverrideLabel(label ?? null);
    return () => setOverrideLabel(null);
  }, [label, setOverrideLabel]);
}
