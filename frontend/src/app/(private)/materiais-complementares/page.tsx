"use client";

import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";
import { UserRoleEnum } from "@/enums";
import MateriaisComplementaresAlunoPage from "./materiaisComplementaresAluno/materiaisComplementaresAluno";
import MateriaisComplementaresProfessorPage from "./materiaisComplementaresProfessor/materiaisComplementaresProfessor";

export default function MateriaisComplementaresPage() {
  const { perfilAtivo } = usePerfilAtivo();

  if (!perfilAtivo) return <LoadingComponent />;

  // O responsavel ve a MESMA tela do aluno — a diferenca esta na fonte de
  // dados, resolvida dentro do componente por useContextoAluno.
  //
  // Quem decide e o perfil ATIVO, nao o perfil principal: um professor que
  // tambem e responsavel tem PROFESSOR como principal (precedencia) e cairia
  // na tela do professor mesmo navegando como responsavel.
  if (
    perfilAtivo === UserRoleEnum.ESTUDANTE ||
    perfilAtivo === UserRoleEnum.RESPONSAVEL
  ) {
    return <MateriaisComplementaresAlunoPage />;
  }

  return <MateriaisComplementaresProfessorPage />;
}
