"use client";
import Badge from "@/components/badge";
import { useAlunosPorAvaliacaoTurma } from "@/hooks/useAlunosPorAvaliacaoTurma";
import { useAvaliacao } from "@/hooks/useAvaliacao";
import { useAvaliacaoTurmas } from "@/hooks/useAvaliacaoTurmas";
import { RoutesEnum } from "@/enums";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import GradeRounded from "@mui/icons-material/GradeRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useSalvarNotasAvaliacaoTurma } from "./useSalvarNotasAvaliacaoTurma";
import * as S from "./styles";

function LancarNotasContent() {
  const searchParams = useSearchParams();
  const avaliacaoTurmaId = Number(searchParams.get("avaliacaoTurmaId") ?? 0);
  const avaliacaoId = searchParams.get("avaliacaoId") ?? "";
  const router = useRouter();

  const { avaliacao, loading: loadingAvaliacao } = useAvaliacao(avaliacaoId);
  const { turmas } = useAvaliacaoTurmas(avaliacaoId);
  const { alunos, loading: loadingAlunos } = useAlunosPorAvaliacaoTurma(avaliacaoTurmaId || null);
  const { salvarNotas } = useSalvarNotasAvaliacaoTurma(avaliacaoId);

  const turmaAtual = useMemo(() => turmas.find((t) => t.id === avaliacaoTurmaId), [turmas, avaliacaoTurmaId]);

  const [notas, setNotas] = useState<Record<number, string>>({});
  const [salvoRecentemente, setSalvoRecentemente] = useState(false);

  const loading = loadingAvaliacao || loadingAlunos;

  function handleNotaChange(alunoId: number, valor: string) {
    setNotas((atual) => ({ ...atual, [alunoId]: valor }));
    setSalvoRecentemente(false);
  }

  function handleSalvar() {
    if (!avaliacao) return;
    salvarNotas.mutate(
      {
        avaliacaoTurmaId,
        periodoReferencia: turmaAtual?.dataAplicacao || new Date().toISOString().split("T")[0],
        notas: alunos
          .filter((aluno) => notas[aluno.id] !== undefined && notas[aluno.id] !== "")
          .map((aluno) => ({
            alunoId: aluno.id,
            pontuacao: Number(notas[aluno.id].replace(",", ".")),
          })),
      },
      { onSuccess: () => setSalvoRecentemente(true) },
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!avaliacao || !avaliacaoTurmaId) {
    return <Alert severity="error">Erro ao carregar dados da turma. Por favor, tente novamente.</Alert>;
  }

  const notasPreenchidas = Object.values(notas).filter((v) => v !== "").length;
  const valoresNumericos = Object.values(notas)
    .map((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .filter((v): v is number => v !== null && !isNaN(v));
  const media = valoresNumericos.length
    ? valoresNumericos.reduce((a, b) => a + b, 0) / valoresNumericos.length
    : null;

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3.5 }, pb: 6 }}>
      <S.PageHeader>
        <S.BackLink onClick={() => router.push(`${RoutesEnum.AVALIACAO_DETALHE}?id=${avaliacaoId}`)}>
          <ArrowBackRounded />
          {avaliacao.nome}
        </S.BackLink>

        <S.TopRow>
          <div>
            <S.Title>Lançar notas — {turmaAtual?.turma ?? ""}</S.Title>
            <S.Subtitle>
              {avaliacao.nome} · {avaliacao.disciplina} · Nota máxima {avaliacao.notaMaxima}
            </S.Subtitle>
          </div>
          <Button variant="contained" onClick={handleSalvar} disabled={salvarNotas.isPending}>
            {salvarNotas.isPending ? "Salvando..." : "Salvar notas"}
          </Button>
        </S.TopRow>
      </S.PageHeader>

      <S.KpiGrid>
        <S.Kpi>
          <S.KpiTop>
            <S.KpiLabel>Alunos</S.KpiLabel>
            <S.KpiIcon $tone="primary">
              <GroupRounded />
            </S.KpiIcon>
          </S.KpiTop>
          <S.KpiValue>{alunos.length}</S.KpiValue>
        </S.Kpi>
        <S.Kpi>
          <S.KpiTop>
            <S.KpiLabel>Notas lançadas</S.KpiLabel>
            <S.KpiIcon $tone="info">
              <EditNoteRounded />
            </S.KpiIcon>
          </S.KpiTop>
          <S.KpiValue>
            {notasPreenchidas}/{alunos.length}
          </S.KpiValue>
        </S.Kpi>
        <S.Kpi>
          <S.KpiTop>
            <S.KpiLabel>Média da avaliação</S.KpiLabel>
            <S.KpiIcon $tone="success">
              <GradeRounded />
            </S.KpiIcon>
          </S.KpiTop>
          <S.KpiValue>{media === null ? "—" : media.toFixed(1).replace(".", ",")}</S.KpiValue>
        </S.Kpi>
      </S.KpiGrid>

      {salvoRecentemente && (
        <S.SavedBar>
          <CheckCircleRounded />
          Notas salvas com sucesso.
        </S.SavedBar>
      )}

      <S.ListPanel>
        <S.ListHead>
          <span>Aluno</span>
          <span>Nota (0–{avaliacao.notaMaxima})</span>
          <span>Situação</span>
        </S.ListHead>
        {alunos.map((aluno) => {
          const raw = notas[aluno.id];
          const num = raw === undefined || raw === "" ? null : Number(raw.replace(",", "."));
          const preenchida = num !== null && !isNaN(num);
          return (
            <S.Row key={aluno.id}>
              <S.Aluno>
                <S.AlunoName>{aluno.nome}</S.AlunoName>
              </S.Aluno>
              <S.NotaInputWrap>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="—"
                  value={raw ?? ""}
                  onChange={(e) => handleNotaChange(aluno.id, e.target.value)}
                />
              </S.NotaInputWrap>
              <S.Situacao>
                {preenchida ? (
                  <Badge $tone={num! < avaliacao.notaMaxima / 2 ? "error" : "success"}>
                    {num!.toFixed(1).replace(".", ",")}
                  </Badge>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Pendente
                  </Typography>
                )}
              </S.Situacao>
            </S.Row>
          );
        })}
      </S.ListPanel>
    </Box>
  );
}

export default function LancarNotasPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <LancarNotasContent />
    </Suspense>
  );
}
