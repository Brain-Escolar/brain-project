"use client";
import { useAuth } from "@/hooks/useAuth";
import { UserRoleEnum } from "@/utils/auth";
import { RoutesEnum } from "@/enums";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRoleEnum[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        switch (user.role) {
          case UserRoleEnum.ESTUDANTE:
            router.push(RoutesEnum.HOME_ESTUDANTE);
            break;
          case UserRoleEnum.PROFESSOR:
            router.push(RoutesEnum.HOME);
            break;
          case UserRoleEnum.ADMIN:
            router.push(RoutesEnum.HOME_ADMIN);
            break;
          default:
            router.push(RoutesEnum.HOME);
        }
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
