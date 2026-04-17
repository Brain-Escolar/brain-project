"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "@/hooks/useAuth";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { buildBreadcrumbs } from "./buildBreadcrumbs";
import * as S from "./styles";

interface BreadcrumbsProps {
  currentLabel?: string;
}

function Breadcrumbs({ currentLabel }: BreadcrumbsProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { overrideLabel } = useBreadcrumbContext();

  if (!user || !pathname) return null;

  const items = buildBreadcrumbs(pathname, user.role, currentLabel ?? overrideLabel);
  if (!items || items.length === 0) return null;

  return (
    <S.Nav aria-label="breadcrumb">
      <S.List>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <S.Item key={`${item.label}-${index}`}>
              {item.href && !isLast ? (
                <Link href={item.href} passHref legacyBehavior>
                  <S.CrumbLink>{item.label}</S.CrumbLink>
                </Link>
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
    </S.Nav>
  );
}

export default Breadcrumbs;
