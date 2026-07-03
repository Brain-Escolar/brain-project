"use client";
import Badge from "@/components/badge";
import { BrainMultiSelectControlled } from "@/components/brainForms/brainMultiSelectControlled";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { RoutesEnum } from "@/enums";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { useMinhasTurmas } from "@/hooks/useMinhasTurmas";
import { AvaliacaoListaResponse } from "@/services/domains/avaliacao/response";
import { getDisciplinaIcon } from "@/utils/disciplinaUtils";
import AddRounded from "@mui/icons-material/AddRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import PendingRounded from "@mui/icons-material/PendingRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import ModalCriarAvaliacao from "./components/ModalCriarAvaliacao";
import * as S from "./styles";

const TIPO_LABELS = {
  PROVA: "Prova",
  TRABALHO: "Trabalho",
  LISTA: "Lista",
  SEMINARIO: "Seminário",
} as const;

const TIPO_TONE = {
  PROVA: "primary",
  TRABALHO: "info",
  LISTA: "neutral",
  SEMINARIO: "warning",
} as const;

function StatusBadge({ av }: { av: AvaliacaoListaResponse }) {
  if (av.totalTurmas === 0) {
    return <Badge $tone="neutral">Sem turmas</Badge>;
  }
  if (av.turmasLancadas >= av.totalTurmas) {
    return (
      <Badge $tone="success">
        <CheckRounded sx={{ fontSize: 14 }} />
        Concluído
      </Badge>
    );
  }
  return (
    <Badge $tone="warning">
      <PendingRounded sx={{ fontSize: 14 }} />
      {av.turmasLancadas}/{av.totalTurmas} turmas
    </Badge>
  );
}

export default function AvaliacoesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalAvaliacaoOpen, setModalAvaliacaoOpen] = useState(false);

  const { control } = useForm<{ turmaIds: number[] }>({ defaultValues: { turmaIds: [] } });
  const turmasSelecionadas = useWatch({ control, name: "turmaIds" }) ?? [];

  const { avaliacoes, loading } = useAvaliacoes();
  const { disciplinas: minhasTurmas } = useMinhasTurmas();

  const turmasDisponiveis = useMemo(() => {
    const map = new Map<number, string>();
    minhasTurmas.forEach((disciplina) =>
      disciplina.turmas.forEach((turma) =>
        map.set(turma.turmaId, `${turma.serieNome} ${turma.nomeTurma}`),
      ),
    );
    return Array.from(map.entries()).map(([turmaId, label]) => ({
      key: String(turmaId),
      value: label,
    }));
  }, [minhasTurmas]);

  const filteredAvaliacoes = avaliacoes.filter((av) => {
    const term = searchTerm.toLowerCase();
    const matchTermo =
      av.nome.toLowerCase().includes(term) || av.disciplina.toLowerCase().includes(term);
    const matchTurma =
      turmasSelecionadas.length === 0 || av.turmaIds.some((id) => turmasSelecionadas.includes(id));
    return matchTermo && matchTurma;
  });

  return (
    <PageScaffold
      title="Avaliações"
      description="Crie avaliações, acompanhe o lançamento de notas e edite o conteúdo de cada uma."
      actions={
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setModalAvaliacaoOpen(true)}
        >
          Criar avaliação
        </Button>
      }
    >
      <S.FiltersContainer>
        <S.SearchContainer>
          <S.SearchIcon>
            <SearchRounded />
          </S.SearchIcon>
          <S.SearchInput
            type="text"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </S.SearchContainer>

        <Box sx={{ minWidth: 220 }}>
          <BrainMultiSelectControlled
            name="turmaIds"
            control={control}
            label="Turma"
            options={turmasDisponiveis}
            placeholder="Todas as turmas"
          />
        </Box>
      </S.FiltersContainer>

      {loading ? (
        <LoadingComponent />
      ) : filteredAvaliacoes.length === 0 ? (
        <BrainResultNotFound />
      ) : (
        <S.AvPanel>
          {filteredAvaliacoes.map((av) => {
            const DisciplinaIcon = getDisciplinaIcon(av.disciplina);
            return (
              <S.AvRow
                key={av.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`${RoutesEnum.AVALIACAO_DETALHE}?id=${av.id}`)}
              >
                <S.AvRowIcon>
                  <DisciplinaIcon sx={{ fontSize: 24 }} />
                </S.AvRowIcon>
                <S.AvRowInfo>
                  <S.AvRowTitle>{av.nome}</S.AvRowTitle>
                  <S.AvRowMeta>
                    <span>
                      <MenuBookRounded />
                      {av.disciplina}
                    </span>
                    <span>
                      <GroupsRounded />
                      {av.totalTurmas} turma{av.totalTurmas === 1 ? "" : "s"}
                    </span>
                  </S.AvRowMeta>
                </S.AvRowInfo>
                <S.AvRowRight>
                  <Badge $tone={TIPO_TONE[av.tipo]}>{TIPO_LABELS[av.tipo]}</Badge>
                  <StatusBadge av={av} />
                  <S.AvRowChevron>
                    <ChevronRightRounded />
                  </S.AvRowChevron>
                </S.AvRowRight>
              </S.AvRow>
            );
          })}
        </S.AvPanel>
      )}

      <ModalCriarAvaliacao open={modalAvaliacaoOpen} onClose={() => setModalAvaliacaoOpen(false)} />
    </PageScaffold>
  );
}
