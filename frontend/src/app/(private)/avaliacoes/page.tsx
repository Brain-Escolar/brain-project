"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import PageTitle from "@/components/pageTitle/pageTitle";
import { UserRoleEnum } from "@/enums";
import EvaluationCard from "@/components/evaluationCard/evaluationCard";
import { Container } from "@mui/material";
import { useState } from "react";
import * as S from "./styles";

interface Evaluation {
  id: string;
  title: string;
  subject: string;
  maxScore: number;
  status: "pending" | "review" | "completed";
  progress: number;
  total: number;
  openDate: string;
  dueDate: string;
}

export default function AvaliacoesPage() {
  const [activeTab, setActiveTab] = useState<"avaliacoes" | "tarefas">("avaliacoes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");
  const [selectedSerie, setSelectedSerie] = useState("all");
  const [selectedTurma, setSelectedTurma] = useState("all");

  // Mock data - em produção, estes dados viriam de uma API
  const evaluations: Evaluation[] = [
    {
      id: "1",
      title: "Prova 1",
      subject: "Matemática 1 - 3ªA",
      maxScore: 10,
      status: "pending",
      progress: 0,
      total: 28,
      openDate: "14/01/25",
      dueDate: "14/01/25",
    },
    {
      id: "2",
      title: "Prova 1",
      subject: "Matemática 1 - 3ªA",
      maxScore: 10,
      status: "review",
      progress: 15,
      total: 28,
      openDate: "14/01/25",
      dueDate: "14/01/25",
    },
    {
      id: "3",
      title: "Prova 1",
      subject: "Matemática 1 - 3ªA",
      maxScore: 10,
      status: "pending",
      progress: 0,
      total: 28,
      openDate: "14/01/25",
      dueDate: "14/01/25",
    },
    {
      id: "4",
      title: "Prova 1",
      subject: "Matemática 1 - 3ªA",
      maxScore: 10,
      status: "completed",
      progress: 15,
      total: 28,
      openDate: "14/01/25",
      dueDate: "14/01/25",
    },
  ];

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    totalEvaluations: evaluations.length,
    awaitingGrades: evaluations.filter((e) => e.status === "review").length,
    averageGrade: "80%",
    totalStudents: 125,
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <S.Header>
          <PageTitle
            title="Avaliações e tarefas"
            description="Gerencie avaliações e notas dos alunos"
          />
        </S.Header>

        <S.TabsContainer>
          <S.Tab active={activeTab === "avaliacoes"} onClick={() => setActiveTab("avaliacoes")}>
            ⭐ AVALIAÇÕES
          </S.Tab>
          <S.Tab active={activeTab === "tarefas"} onClick={() => setActiveTab("tarefas")}>
            ⭐ TAREFAS
          </S.Tab>
        </S.TabsContainer>

        <S.FiltersContainer>
          <S.SearchContainer>
            <S.SearchIcon>🔍</S.SearchIcon>
            <S.SearchInput
              type="text"
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </S.SearchContainer>

          <S.FilterSelect
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
          >
            <option value="all">Disciplina</option>
            <option value="matematica">Matemática</option>
            <option value="fisica">Física</option>
          </S.FilterSelect>

          <S.FilterSelect value={selectedSerie} onChange={(e) => setSelectedSerie(e.target.value)}>
            <option value="all">Série</option>
            <option value="1">1ª série</option>
            <option value="2">2ª série</option>
            <option value="3">3ª série</option>
          </S.FilterSelect>

          <S.FilterSelect value={selectedTurma} onChange={(e) => setSelectedTurma(e.target.value)}>
            <option value="all">Turma</option>
            <option value="A">Turma A</option>
            <option value="B">Turma B</option>
            <option value="C">Turma C</option>
          </S.FilterSelect>
        </S.FiltersContainer>

        <S.ContentContainer>
          <S.MainContent>
            <S.EvaluationsList>
              {filteredEvaluations.map((evaluation) => (
                <EvaluationCard
                  key={evaluation.id}
                  title={evaluation.title}
                  subject={evaluation.subject}
                  maxScore={evaluation.maxScore}
                  status={evaluation.status}
                  progress={evaluation.progress}
                  total={evaluation.total}
                  openDate={evaluation.openDate}
                  dueDate={evaluation.dueDate}
                />
              ))}
            </S.EvaluationsList>
          </S.MainContent>

          <S.Sidebar>
            <S.SidebarTitle>Visão geral</S.SidebarTitle>
            <S.SidebarSubtitle>Resumo de todas as avaliações</S.SidebarSubtitle>

            <S.StatCard>
              <S.StatLabel>Total de avaliações</S.StatLabel>
              <S.StatValue>{stats.totalEvaluations}</S.StatValue>
            </S.StatCard>

            <S.StatCard>
              <S.StatLabel>Aguardando notas</S.StatLabel>
              <S.StatValue>{stats.awaitingGrades}</S.StatValue>
            </S.StatCard>

            <S.StatCard>
              <S.StatLabel>Nota média</S.StatLabel>
              <S.StatValue>{stats.averageGrade}</S.StatValue>
            </S.StatCard>

            <S.StatCard>
              <S.StatLabel>Total de alunos</S.StatLabel>
              <S.StatValue>{stats.totalStudents}</S.StatValue>
            </S.StatCard>
          </S.Sidebar>
        </S.ContentContainer>
      </Container>
    </ProtectedRoute>
  );
}
