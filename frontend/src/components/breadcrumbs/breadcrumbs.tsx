"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "@/hooks/useAuth";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { buildBreadcrumbs } from "./buildBreadcrumbs";
import * as S from "./styles";

interface BreadcrumbsProps {
  currentLabel?: string;
}

function Breadcrumbs({ currentLabel }: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { overrideLabel, homeSearchParams } = useBreadcrumbContext();

  if (!user || !pathname) return null;

  const items = buildBreadcrumbs(pathname, user.role, currentLabel ?? overrideLabel);
  if (!items || items.length === 0) return null;

  return (
    <S.Nav aria-label="breadcrumb">
      <S.Wrapper>
        <S.BackButton
          type="button"
          onClick={() => router.back()}
          aria-label="Voltar"
          title="Voltar"
        >
          <ArrowBackIcon fontSize="small" />
        </S.BackButton>

        <S.List>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isHome = index === 0 && item.href;

            // Se é o link "Início" e temos query params salvos, recompõe a URL
            const href =
              isHome && homeSearchParams
                ? `${item.href}?${homeSearchParams}`
                : item.href;

            return (
              <S.Item key={`${item.label}-${index}`}>
                {href && !isLast ? (
                  <S.CrumbLink as={Link} href={href}>
                    {item.label}
                  </S.CrumbLink>
                ) : (
                  <S.CrumbText $current={isLast} aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </S.CrumbText>
                )}
                {!isLast && (
                  <S.Separator aria-hidden="true">
                    <ChevronRightIcon fontSize="small" />
                  </S.Separator>
                )}
              </S.Item>
            );
          })}
        </S.List>
      </S.Wrapper>
    </S.Nav>
  );
}

export default Breadcrumbs;
