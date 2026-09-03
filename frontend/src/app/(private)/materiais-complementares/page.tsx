"use client";

import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import { useAuth } from "@/hooks/useAuth";
import { UserRoleEnum } from "@/enums";
import MateriaisComplementaresAlunoPage from "./materiaisComplementaresAluno/materiaisComplementaresAluno";
import MateriaisComplementaresProfessorPage from "./materiaisComplementaresProfessor/materiaisComplementaresProfessor";

export default function MateriaisComplementaresPage() {
  const { user, isLoading } = useAuth();

  if (isLoading && !user) return <LoadingComponent />;

  // O responsavel ve a MESMA tela do aluno — a diferenca esta na fonte de
  // dados, resolvida dentro do componente por useContextoAluno.
  if (
    user?.role === UserRoleEnum.ESTUDANTE ||
    user?.role === UserRoleEnum.RESPONSAVEL
  ) {
    return <MateriaisComplementaresAlunoPage />;
  }

  return <MateriaisComplementaresProfessorPage />;
}
