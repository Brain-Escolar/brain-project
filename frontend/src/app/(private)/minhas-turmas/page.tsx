"use client";

import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { RoutesEnum } from "@/enums";
import { useMinhasTurmas } from "@/hooks/useMinhasTurmas";
import { getDisciplinaIcon } from "@/utils/disciplinaUtils";
import { useRouter } from "next/navigation";
import TurmaCard from "./components/TurmaCard";
import * as S from "./styles";

export default function MinhasTurmasPage() {
  const router = useRouter();
  const { disciplinas, loading } = useMinhasTurmas();

  const handleAbrirTurma = (turmaId: number, disciplinaId: number) => {
    router.push(`${RoutesEnum.MINHAS_TURMAS_DETALHE}/${turmaId}/${disciplinaId}`);
  };

  return (
    <PageScaffold
      title="Minhas turmas"
      description="Suas turmas organizadas por disciplina. Abra uma turma para ver o resumo de cada aluno."
    >
      {loading ? (
        <LoadingComponent />
      ) : disciplinas.length === 0 ? (
        <BrainResultNotFound />
      ) : (
        <S.DisciplinasList>
          {disciplinas.map((disciplina) => {
            const DisciplinaIcon = getDisciplinaIcon(disciplina.nomeDisciplina);
            return (
              <S.DisciplinaSection key={disciplina.disciplinaId}>
                <S.DisciplinaHeader>
                  <S.DisciplinaIconBox>
                    <DisciplinaIcon fontSize="small" />
                  </S.DisciplinaIconBox>
                  <div>
                    <S.DisciplinaName>{disciplina.nomeDisciplina}</S.DisciplinaName>
                    <S.DisciplinaCount>
                      {disciplina.turmas.length} turma{disciplina.turmas.length > 1 ? "s" : ""}
                    </S.DisciplinaCount>
                  </div>
                </S.DisciplinaHeader>
                <S.TurmasGrid>
                  {disciplina.turmas.map((turma) => (
                    <TurmaCard
                      key={turma.turmaId}
                      turma={turma}
                      nomeDisciplina={disciplina.nomeDisciplina}
                      onClick={() => handleAbrirTurma(turma.turmaId, disciplina.disciplinaId)}
                    />
                  ))}
                </S.TurmasGrid>
              </S.DisciplinaSection>
            );
          })}
        </S.DisciplinasList>
      )}
    </PageScaffold>
  );
}
