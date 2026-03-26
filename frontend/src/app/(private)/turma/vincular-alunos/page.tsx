"use client";
import { UserRoleEnum } from "@/enums";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useAlunos } from "@/hooks/useAlunos";
import { useTurma } from "@/hooks/useTurma";
import {
  Alert,
  Box,
  Checkbox,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { Suspense, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { turmaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import * as S from "./styles";

function VincularAlunosPageContent() {
  const router = useRouter();
  const turmaId = useBrainSearchParams("turmaId");

  const { turma, loading: loadingTurma, error: errorTurma } = useTurma(turmaId);
  const { alunos, loading: loadingAlunos } = useAlunos();

  const [selectedAlunoIds, setSelectedAlunoIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const vincularMutation = useMutation({
    mutationFn: () =>
      turmaApi.vincularAlunos({
        turmaId: turmaId!,
        alunoIds: selectedAlunoIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.all });
      toast.success("Alunos vinculados com sucesso!");
      router.push("/turma/lista");
    },
    onError: (error) => {
      console.error("Erro ao vincular alunos:", error);
      toast.error("Erro ao vincular alunos. Tente novamente.");
    },
  });

  const filteredAlunos = useMemo(() => {
    if (!search) return alunos;
    const s = search.toLowerCase();
    return alunos.filter(
      (a) =>
        a.nome.toLowerCase().includes(s) ||
        a.matricula.toLowerCase().includes(s) ||
        a.cpf.includes(s),
    );
  }, [alunos, search]);

  function toggleAluno(alunoId: number) {
    setSelectedAlunoIds((prev) =>
      prev.includes(alunoId) ? prev.filter((id) => id !== alunoId) : [...prev, alunoId],
    );
  }

  function handleSelectAll() {
    if (selectedAlunoIds.length === filteredAlunos.length) {
      setSelectedAlunoIds([]);
    } else {
      setSelectedAlunoIds(filteredAlunos.map((a) => a.id));
    }
  }

  function handleSave() {
    vincularMutation.mutate();
  }

  function handleCancel() {
    router.push("/turma/lista");
  }

  if (!turmaId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Nenhuma turma selecionada. Volte para a lista de turmas e selecione uma turma.
        </Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {(loadingTurma || loadingAlunos) ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorTurma ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorTurma}
          </Alert>
        ) : (
          <>
            <PageTitle
              title={`Vincular Alunos — ${turma?.nome || ""}`}
              description="Selecione os alunos que devem ser vinculados a esta turma."
            />

            <S.PageLayout>
              {/* Coluna principal */}
              <div>
                <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por nome, matrícula ou CPF..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <BrainButtonSecondary onClick={handleSelectAll}>
                    {selectedAlunoIds.length === filteredAlunos.length
                      ? "Desmarcar Todos"
                      : "Selecionar Todos"}
                  </BrainButtonSecondary>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {filteredAlunos.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        Nenhum aluno encontrado.
                      </Typography>
                      {alunos.length === 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => router.push("/aluno")}
                        >
                          Cadastrar Aluno
                        </Button>
                      )}
                    </Box>
                  ) : (
                    filteredAlunos.map((aluno) => {
                      const isChecked = selectedAlunoIds.includes(aluno.id);
                      return (
                        <S.AlunoCheckItem
                          key={aluno.id}
                          $checked={isChecked}
                          onClick={() => toggleAluno(aluno.id)}
                        >
                          <Checkbox checked={isChecked} size="small" sx={{ p: 0 }} />
                          <div className="aluno-info">
                            <span className="aluno-nome">
                              <PersonIcon
                                sx={{
                                  fontSize: 14,
                                  mr: 0.5,
                                  verticalAlign: "text-bottom",
                                }}
                              />
                              {aluno.nome}
                            </span>
                            <span className="aluno-meta">
                              Matrícula: {aluno.matricula} · CPF: {aluno.cpf}
                            </span>
                          </div>
                        </S.AlunoCheckItem>
                      );
                    })
                  )}
                </Box>
              </div>

              {/* Sidebar */}
              <S.SidebarCard>
                <S.SidebarHeader>
                  <h4>
                    <GroupsIcon
                      sx={{
                        fontSize: 16,
                        mr: 0.5,
                        verticalAlign: "text-bottom",
                      }}
                    />
                    Resumo da Vinculação
                  </h4>
                </S.SidebarHeader>
                <S.StatsContainer>
                  <div className="stats-number">{selectedAlunoIds.length}</div>
                  <div className="stats-label">
                    alunos selecionados de {turma?.vagasTotais || "—"} vagas
                  </div>
                </S.StatsContainer>
                <S.ResumoItem>
                  <span className="resumo-label">Turma</span>
                  <span className="resumo-value">{turma?.nome || "—"}</span>
                </S.ResumoItem>
                <S.ResumoItem>
                  <span className="resumo-label">Vagas Totais</span>
                  <span className="resumo-value">{turma?.vagasTotais || "—"}</span>
                </S.ResumoItem>
                <S.ResumoItem>
                  <span className="resumo-label">Já Matriculados</span>
                  <span className="resumo-value">{turma?.alunosMatriculados || 0}</span>
                </S.ResumoItem>
                <S.ResumoItem>
                  <span className="resumo-label">Vagas Restantes</span>
                  <span className="resumo-value">
                    {turma
                      ? turma.vagasTotais - turma.alunosMatriculados
                      : "—"}
                  </span>
                </S.ResumoItem>

                {selectedAlunoIds.length > 0 && (
                  <>
                    <S.SidebarHeader>
                      <h4>Alunos Selecionados</h4>
                    </S.SidebarHeader>
                    {alunos
                      .filter((a) => selectedAlunoIds.includes(a.id))
                      .map((aluno) => (
                        <S.ResumoItem key={aluno.id}>
                          <span className="resumo-label">{aluno.nome}</span>
                          <span className="resumo-value">{aluno.matricula}</span>
                        </S.ResumoItem>
                      ))}
                  </>
                )}
              </S.SidebarCard>
            </S.PageLayout>

            {/* Botões de ação */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
              <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
              <BrainButtonPrimary
                onClick={handleSave}
                disabled={
                  selectedAlunoIds.length === 0 || vincularMutation.isPending
                }
              >
                {vincularMutation.isPending
                  ? "Salvando..."
                  : `Vincular ${selectedAlunoIds.length} Aluno(s)`}
              </BrainButtonPrimary>
            </Box>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export default function VincularAlunosPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <VincularAlunosPageContent />
    </Suspense>
  );
}
