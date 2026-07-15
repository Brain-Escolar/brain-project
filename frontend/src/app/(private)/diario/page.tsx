"use client";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useSeries } from "@/hooks/useSeries";
import { useTarefasProfessor } from "@/hooks/useTarefasProfessor";
import SearchRounded from "@mui/icons-material/SearchRounded";
import { useState } from "react";
import FormNovoLancamento from "./components/FormNovoLancamento";
import TarefaCard from "./components/TarefaCard";
import * as S from "./styles";

type Aba = "novo" | "lancamentos";

export default function DiarioPage() {
  const [aba, setAba] = useState<Aba>("novo");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState("");
  const [selectedSerieId, setSelectedSerieId] = useState("");

  const { tarefas, loading } = useTarefasProfessor(true);
  const { disciplinas } = useDisciplinas();
  const { series } = useSeries();

  const filteredTarefas = tarefas.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchTermo = t.conteudo.toLowerCase().includes(term) || t.turma.toLowerCase().includes(term);
    const matchDisciplina = !selectedDisciplinaId || String(t.disciplinaId) === selectedDisciplinaId;
    const matchSerie = !selectedSerieId || String(t.serieId) === selectedSerieId;
    return matchTermo && matchDisciplina && matchSerie;
  });

  return (
    <PageScaffold
      title="Diário"
      description="Registre o conteúdo das aulas e as tarefas de casa das suas turmas, e acompanhe os lançamentos."
    >
      <S.Seg role="tablist" aria-label="Modo de visualização">
        <S.SegButton type="button" $active={aba === "novo"} role="tab" aria-selected={aba === "novo"} onClick={() => setAba("novo")}>
          Novo lançamento
        </S.SegButton>
        <S.SegButton
          type="button"
          $active={aba === "lancamentos"}
          role="tab"
          aria-selected={aba === "lancamentos"}
          onClick={() => setAba("lancamentos")}
        >
          Lançamentos {tarefas.length > 0 && `(${tarefas.length})`}
        </S.SegButton>
      </S.Seg>

      {aba === "novo" ? (
        <FormNovoLancamento />
      ) : (
        <S.ContentContainer>
          <S.MainContent>
            <S.FiltersContainer>
              <S.SearchContainer>
                <S.SearchIcon>
                  <SearchRounded fontSize="inherit" />
                </S.SearchIcon>
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

              <S.FilterSelect value={selectedSerieId} onChange={(e) => setSelectedSerieId(e.target.value)}>
                <option value="">Série</option>
                {series.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.nome}
                  </option>
                ))}
              </S.FilterSelect>
            </S.FiltersContainer>

            {loading ? (
              <LoadingComponent />
            ) : filteredTarefas.length === 0 ? (
              <BrainResultNotFound />
            ) : (
              <S.ListPanel>
                {filteredTarefas.map((t) => (
                  <TarefaCard key={t.id} tarefa={t} />
                ))}
              </S.ListPanel>
            )}
          </S.MainContent>

          <S.Sidebar>
            <S.SidebarTitle>Visão geral</S.SidebarTitle>
            <S.SidebarSubtitle>Resumo de todas as tarefas</S.SidebarSubtitle>

            <S.StatCard>
              <S.StatLabel>Total de lançamentos</S.StatLabel>
              <S.StatValue>{tarefas.length}</S.StatValue>
            </S.StatCard>
          </S.Sidebar>
        </S.ContentContainer>
      )}
    </PageScaffold>
  );
}
