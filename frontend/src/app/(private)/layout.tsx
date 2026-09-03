"use client";

import { Suspense } from "react";
import AppBar from "@/components/appBar/appBar";
import Breadcrumbs from "@/components/breadcrumbs";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { AlunoSelecionadoProvider } from "@/contexts/AlunoSelecionadoContext";
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
    <Suspense>
      <BreadcrumbProvider>
        {/*
          O provider e montado para todos os perfis, mas so busca dados quando
          o usuario e RESPONSAVEL — para os demais o hook devolve alunoId null
          e as telas compartilhadas seguem com a fonte de dados de sempre.
        */}
        <AlunoSelecionadoProvider>
          <PrivateLayoutContent>{children}</PrivateLayoutContent>
        </AlunoSelecionadoProvider>
      </BreadcrumbProvider>
    </Suspense>
  );
}
