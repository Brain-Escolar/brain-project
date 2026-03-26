"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { UserRoleEnum } from "@/enums";
import { useAvaliacaoDetalheComAlunos } from "@/hooks/useAvaliacaoDetalheComAlunos";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { AccessTime, ArrowBack, CalendarToday, Cancel, CancelOutlined } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAvaliacaoDetalheMutations } from "./useAvaliacaoDetalheMutations";
import { MetaItem, MetaRow, PageHeader, ProgressWrapper, TitleRow } from "./styles";

interface NotaState {
  nota: string;
  falta: boolean;
}

function AvaliacaoDetalheContent() {
  const searchParams = useSearchParams();
  const avaliacaoId = searchParams.get("id") ?? "";
  const router = useRouter();

  const { data, loading, error } = useAvaliacaoDetalheComAlunos(avaliacaoId);
  const { salvarNotas } = useAvaliacaoDetalheMutations();

  const [notas, setNotas] = useState<Record<number, NotaState>>({});

  useEffect(() => {
    if (data) {
      const initial: Record<number, NotaState> = {};
      data.alunos.forEach((aluno) => {
        initial[aluno.alunoId] = {
          nota: aluno.nota !== null ? String(aluno.nota) : "",
          falta: aluno.falta,
        };
      });
      setNotas(initial);
    }
  }, [data]);

  const handleToggleFalta = (alunoId: number) => {
    setNotas((prev) => {
      const currentFalta = prev[alunoId]?.falta ?? false;
      return {
        ...prev,
        [alunoId]: {
          nota: !currentFalta ? "" : (prev[alunoId]?.nota ?? ""),
          falta: !currentFalta,
        },
      };
    });
  };

  const handleNotaChange = (alunoId: number, value: string) => {
    setNotas((prev) => ({
      ...prev,
      [alunoId]: { ...prev[alunoId], nota: value },
    }));
  };

  const notasLancadasCount = Object.values(notas).filter((n) => !n.falta && n.nota !== "").length;

  const handleSalvar = () => {
    if (!data) return;
    salvarNotas.mutate({
      avaliacaoId: data.id,
      alunos: data.alunos.map((aluno) => ({
        alunoId: aluno.alunoId,
        nota: notas[aluno.alunoId]?.nota ? Number(notas[aluno.alunoId].nota) : null,
        falta: notas[aluno.alunoId]?.falta ?? false,
      })),
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error">
        Erro ao carregar detalhes da avaliação. Por favor, tente novamente.
      </Alert>
    );
  }

  const progressValue = data.totalAlunos > 0 ? (notasLancadasCount / data.totalAlunos) * 100 : 0;

  return (
    <Container maxWidth="lg">
      <PageHeader>
        {/* Breadcrumb */}
        <Link
          component="button"
          variant="body2"
          onClick={() => router.back()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.primary",
            textDecoration: "none",
            width: "fit-content",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          <ArrowBack sx={{ fontSize: 16 }} />
          Avaliações e tarefas
        </Link>

        {/* Title + actions row */}
        <TitleRow>
          <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }}>
            {data.nomeAvaliacao}
          </Typography>

          <MetaRow>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {data.disciplina} - {data.turma}
            </Typography>

            <MetaItem>
              <AccessTime sx={{ fontSize: 16 }} />
              <span>Abertura: {data.abertura}</span>
            </MetaItem>

            <MetaItem>
              <CalendarToday sx={{ fontSize: 16 }} />
              <span>Prazo: {data.prazo}</span>
            </MetaItem>

            <ProgressWrapper>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(0,0,0,0.12)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "rgba(0,0,0,0.87)",
                    borderRadius: 2,
                  },
                }}
              />
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ whiteSpace: "nowrap", minWidth: 35, textAlign: "right" }}
              >
                {notasLancadasCount}/{data.totalAlunos}
              </Typography>
            </ProgressWrapper>

            <Button variant="contained" onClick={handleSalvar} disabled={salvarNotas.isPending}>
              {salvarNotas.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </MetaRow>
        </TitleRow>
      </PageHeader>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Avaliação</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 200 }}>Nota</TableCell>
              <TableCell sx={{ fontWeight: 500, width: 120 }}>Falta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.alunos.map((aluno) => {
              const state = notas[aluno.alunoId];
              const temFalta = state?.falta ?? false;

              return (
                <TableRow
                  key={aluno.alunoId}
                  sx={{
                    backgroundColor: temFalta ? "rgba(211, 47, 47, 0.08)" : "transparent",
                  }}
                >
                  <TableCell>
                    <Typography variant="body2">{aluno.nomeAluno}</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="outlined"
                      value={state?.nota ?? ""}
                      disabled={temFalta}
                      onChange={(e) => handleNotaChange(aluno.alunoId, e.target.value)}
                      inputProps={{ type: "number", min: 0 }}
                      sx={{ width: 108 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleToggleFalta(aluno.alunoId)}
                      color={temFalta ? "error" : "default"}
                      size="medium"
                    >
                      {temFalta ? <Cancel /> : <CancelOutlined />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default function AvaliacaoDetalhePage() {
  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        }
      >
        <AvaliacaoDetalheContent />
      </Suspense>
    </ProtectedRoute>
  );
}
