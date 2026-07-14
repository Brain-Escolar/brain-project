"use client";

import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import { useAuth } from "@/hooks/useAuth";
import { UserRoleEnum } from "@/enums";
import MateriaisComplementaresAlunoPage from "./materiaisComplementaresAluno/materiaisComplementaresAluno";
import MateriaisComplementaresProfessorPage from "./materiaisComplementaresProfessor/materiaisComplementaresProfessor";

export default function MateriaisComplementaresPage() {
  const { user, isLoading } = useAuth();

  if (isLoading && !user) return <LoadingComponent />;

  if (user?.role === UserRoleEnum.ESTUDANTE) {
    return <MateriaisComplementaresAlunoPage />;
  }

  return <MateriaisComplementaresProfessorPage />;
}
