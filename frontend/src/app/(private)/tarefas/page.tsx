"use client";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useSeries } from "@/hooks/useSeries";
import { useTarefasProfessor } from "@/hooks/useTarefasProfessor";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { useState } from "react";
import TarefaCard from "./components/TarefaCard";
import ModalCriarTarefa from "./components/ModalCriarTarefa";
import * as S from "./styles";

export default function TarefasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState("");
  const [selectedSerieId, setSelectedSerieId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { tarefas, loading } = useTarefasProfessor();
  const { disciplinas } = useDisciplinas();
  const { series } = useSeries();

  const filteredTarefas = tarefas.filter((t) => {
    const term = searchTerm.toLowerCase();
    return t.conteudo.toLowerCase().includes(term) || t.professor.toLowerCase().includes(term);
  });

  return (
    <PageScaffold title="Tarefas" description="Gerencie as tarefas passadas para os alunos">
      <S.ContentContainer>
        <S.MainContent>
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
              value={selectedDisciplinaId}
              onChange={(e) => setSelectedDisciplinaId(e.target.value)}
            >
              <option value="">Disciplina</option>
              {disciplinas.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.nome}
                </option>
              ))}
            </S.FilterSelect>

            <S.FilterSelect
              value={selectedSerieId}
              onChange={(e) => setSelectedSerieId(e.target.value)}
            >
              <option value="">Série</option>
              {series.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.nome}
                </option>
              ))}
            </S.FilterSelect>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
              sx={{ whiteSpace: "nowrap" }}
            >
              ADICIONAR
            </Button>
          </S.FiltersContainer>

          {loading ? (
            <LoadingComponent />
          ) : filteredTarefas.length === 0 ? (
            <BrainResultNotFound />
          ) : (
            filteredTarefas.map((t) => <TarefaCard key={t.id} tarefa={t} />)
          )}
        </S.MainContent>

        <S.Sidebar>
          <S.SidebarTitle>Visão geral</S.SidebarTitle>
          <S.SidebarSubtitle>Resumo de todas as tarefas</S.SidebarSubtitle>

          <S.StatCard>
            <S.StatLabel>Total de tarefas</S.StatLabel>
            <S.StatValue>{tarefas.length}</S.StatValue>
          </S.StatCard>
        </S.Sidebar>
      </S.ContentContainer>

      <ModalCriarTarefa open={modalOpen} onClose={() => setModalOpen(false)} />
    </PageScaffold>
  );
}
