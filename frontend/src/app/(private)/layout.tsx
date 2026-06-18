"use client";

import AppBar from "@/components/appBar/appBar";
import Breadcrumbs from "@/components/breadcrumbs";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import * as S from "./styles";
import { Container } from "@mui/material";

function PrivateLayoutContent({ children }: { children: React.ReactNode }) {

  return (
    <S.Container>
      <AppBar />
      <S.Content>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Breadcrumbs />
          {children}
        </Container>
      </S.Content>
    </S.Container>
  );
}

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BreadcrumbProvider>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </BreadcrumbProvider>
  );
}
