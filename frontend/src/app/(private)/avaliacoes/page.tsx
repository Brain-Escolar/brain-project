"use client";
import EvaluationCard from "@/components/evaluationCard/evaluationCard";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { RoutesEnum } from "@/enums";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useSeries } from "@/hooks/useSeries";
import { useTarefasProfessor } from "@/hooks/useTarefasProfessor";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TarefaCard from "./components/TarefaCard";
import ModalCriarTarefa from "./components/ModalCriarTarefa";
import * as S from "./styles";

export default function AvaliacoesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"avaliacoes" | "tarefas">("avaliacoes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState("");
  const [selectedSerieId, setSelectedSerieId] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { avaliacoes, loading: loadingAvaliacoes } = useAvaliacoes();
  const { tarefas, loading: loadingTarefas } = useTarefasProfessor();
  const { disciplinas } = useDisciplinas();
  const { series } = useSeries();

  const filteredAvaliacoes = avaliacoes.filter((av) => {
    const term = searchTerm.toLowerCase();
    return (
      av.nome.toLowerCase().includes(term) || av.disciplina.toLowerCase().includes(term)
    );
  });

  const filteredTarefas = tarefas.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.titulo.toLowerCase().includes(term) ||
      (t.conteudo?.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <PageScaffold title="Avaliações e tarefas" description="Gerencie avaliações e notas dos alunos">

      <S.TabsContainer>
        <S.Tab active={activeTab === "avaliacoes"} onClick={() => setActiveTab("avaliacoes")}>
          ⭐ AVALIAÇÕES
        </S.Tab>
        <S.Tab active={activeTab === "tarefas"} onClick={() => setActiveTab("tarefas")}>
          ⭐ TAREFAS
        </S.Tab>
      </S.TabsContainer>

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

            {activeTab === "avaliacoes" && (
              <S.FilterSelect
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
              >
                <option value="">Turma</option>
              </S.FilterSelect>
            )}

            {activeTab === "tarefas" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setModalOpen(true)}
                sx={{ whiteSpace: "nowrap" }}
              >
                ADICIONAR
              </Button>
            )}
          </S.FiltersContainer>

          {activeTab === "avaliacoes" ? (
            loadingAvaliacoes ? (
              <LoadingComponent />
            ) : filteredAvaliacoes.length === 0 ? (
              <BrainResultNotFound />
            ) : (
              <S.EvaluationsList>
                {filteredAvaliacoes.map((av) => (
                  <S.ClickableCard
                    key={av.id}
                    onClick={() => router.push(`${RoutesEnum.AVALIACAO_DETALHE}?id=${av.id}`)}
                  >
                    <EvaluationCard
                      title={av.nome}
                      subject={av.disciplina}
                      maxScore={av.peso}
                      status="pending"
                      progress={0}
                      total={0}
                      openDate="-"
                      dueDate="-"
                    />
                  </S.ClickableCard>
                ))}
              </S.EvaluationsList>
            )
          ) : loadingTarefas ? (
            <LoadingComponent />
          ) : filteredTarefas.length === 0 ? (
            <BrainResultNotFound />
          ) : (
            filteredTarefas.map((t) => <TarefaCard key={t.id} tarefa={t} />)
          )}
        </S.MainContent>

        <S.Sidebar>
          <S.SidebarTitle>Visão geral</S.SidebarTitle>
          <S.SidebarSubtitle>Resumo de todas as avaliações</S.SidebarSubtitle>

          <S.StatCard>
            <S.StatLabel>Total de avaliações</S.StatLabel>
            <S.StatValue>{avaliacoes.length}</S.StatValue>
          </S.StatCard>

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
