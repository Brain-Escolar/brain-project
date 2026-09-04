"use client";

import { useRouter } from "next/navigation";
import AlunosView from "@/components/alunosView/AlunosView";
import { RoutesEnum } from "@/enums";
import * as S from "./styles";

/**
 * Card de busca de alunos da tela inicial do orientador. É a mesma tela de
 * `/orientacao/alunos`, no modo compacto: sem paginação e sem listar nada antes
 * de o usuário informar um critério.
 */
export default function SectionBuscaAlunos() {
  const router = useRouter();

  return (
    <AlunosView
      compacto
      atalhosSerie
      titulo="Buscar alunos"
      acoesTopo={
        <S.LinkButton type="button" onClick={() => router.push(RoutesEnum.ORIENTACAO_ALUNOS)}>
          Ver todos
        </S.LinkButton>
      }
    />
  );
}
