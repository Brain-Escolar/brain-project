"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { RoutesEnum } from "@/enums";

/** Conjunto de pathnames considerados "home" no app. */
const HOME_PATHNAMES = new Set<string>([
  RoutesEnum.HOME,
  RoutesEnum.HOME_ESTUDANTE,
  RoutesEnum.HOME_ADMIN,
]);

interface BreadcrumbContextType {
  overrideLabel: string | null;
  setOverrideLabel: (label: string | null) => void;
  /** Query params da home capturados ao sair dela. */
  homeSearchParams: string | null;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [overrideLabel, setOverrideLabelState] = useState<string | null>(null);
  const [homeSearchParams, setHomeSearchParams] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    setOverrideLabelState(null);
  }, [pathname]);

  // Captura os query params ao sair de uma página home
  useEffect(() => {
    const prevPath = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    // Se o pathname anterior era uma home e o atual não é, salva os params
    if (prevPath && HOME_PATHNAMES.has(prevPath) && !HOME_PATHNAMES.has(pathname)) {
      const params = searchParams.toString();
      setHomeSearchParams(params || null);
    }
  }, [pathname, searchParams]);

  const setOverrideLabel = useCallback((label: string | null) => {
    setOverrideLabelState(label);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ overrideLabel, setOverrideLabel, homeSearchParams }}>
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
