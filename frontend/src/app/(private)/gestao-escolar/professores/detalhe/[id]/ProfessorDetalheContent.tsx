"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, LinearProgress, Skeleton, Tab, Tabs } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useBreadcrumbOverride } from "@/contexts/BreadcrumbContext";
import { RoutesEnum } from "@/enums";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { useAcompanhamentoProfessor, useLembrarProfessores } from "@/hooks/useDiretor";
import * as S from "../../styles";
import AbaVisaoGeral from "../../_components/AbaVisaoGeral";
import AbaDiario from "../../_components/AbaDiario";
import AbaNotas from "../../_components/AbaNotas";
import AbaAnotacoes from "../../_components/AbaAnotacoes";
import { iniciais, plural, situacaoProfessor } from "../../_components/apresentacao";

const ABAS = [
  { id: "geral", label: "Visão geral" },
  { id: "diario", label: "Diário de classe" },
  { id: "notas", label: "Notas" },
  { id: "anotacoes", label: "Anotações sobre alunos" },
] as const;

type Aba = (typeof ABAS)[number]["id"];

/** Acompanhamento de um professor pela Direção. A aba inicial pode vir em `?aba=`. */
export default function ProfessorDetalheContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const abaInicial = useBrainSearchParams("aba");
  const [aba, setAba] = useState<Aba>(ABAS.some((a) => a.id === abaInicial) ? (abaInicial as Aba) : "geral");
  const [semana, setSemana] = useState<string | undefined>();

  const professorId = Number(id);
  const { acompanhamento: dados, loading, atualizando, error } = useAcompanhamentoProfessor(professorId, semana);
  const lembrar = useLembrarProfessores();
  useBreadcrumbOverride(dados?.professor.nome);

  const voltar = (
    <Button
      variant="text"
      startIcon={<ArrowBackIcon />}
      onClick={() => router.push(RoutesEnum.GESTAO_PROFESSORES)}
      sx={{ alignSelf: "flex-start" }}
    >
      Voltar aos professores
    </Button>
  );

  if (error) {
    return (
      <PageScaffold>
        <S.Page>
          {voltar}
          <S.Vazio>
            <strong>{error}</strong>
            <span>Verifique se o professor existe e tente novamente.</span>
          </S.Vazio>
        </S.Page>
      </PageScaffold>
    );
  }

  if (loading || !dados) {
    return (
      <PageScaffold>
        <S.Page>
          {voltar}
          <Skeleton variant="rounded" height={104} />
          <Skeleton variant="rounded" height={460} />
        </S.Page>
      </PageScaffold>
    );
  }

  const { professor } = dados;
  const situ = situacaoProfessor({
    situacao: professor.situacao,
    aulasPendentes: dados.resumo.aulasPendentes,
    avaliacoesPendentes: dados.resumo.avaliacoesPendentes,
  });
  const pendente = professor.situacao === "PENDENTE";
  const enviarLembrete = pendente ? () => lembrar.mutate([professor.id]) : undefined;
  const turmas = new Set(dados.turmas.map((t) => t.turmaId)).size;

  return (
    <PageScaffold>
      <S.Page>
        {voltar}

        <S.Cabecalho>
          <S.Iniciais $grande>{iniciais(professor.nome)}</S.Iniciais>
          <S.CabecalhoInfo>
            <S.CabecalhoNome>
              <h1>{professor.nome}</h1>
              <S.Selo $tom={situ.tom}>{situ.rotulo}</S.Selo>
            </S.CabecalhoNome>
            <S.Meta>
              <span>
                <MenuBookOutlinedIcon />
                {professor.disciplinas.join(", ") || "Sem disciplina na grade"}
              </span>
              <span>
                <GroupsOutlinedIcon />
                {plural(turmas, "turma", "turmas")}
              </span>
              {professor.turnos.length > 0 && (
                <span>
                  <ScheduleOutlinedIcon />
                  {professor.turnos.join(", ")}
                </span>
              )}
              {professor.unidades.length > 0 && (
                <span>
                  <ApartmentOutlinedIcon />
                  {professor.unidades.join(", ")}
                </span>
              )}
            </S.Meta>
          </S.CabecalhoInfo>
          <S.Acoes>
            <Button
              variant="outlined"
              startIcon={<BadgeOutlinedIcon />}
              onClick={() => router.push(`${RoutesEnum.PROFESSOR_CADASTRO}?id=${professor.id}`)}
            >
              Ficha cadastral
            </Button>
            <Button
              variant="contained"
              startIcon={<NotificationsNoneOutlinedIcon />}
              onClick={enviarLembrete}
              disabled={!pendente || lembrar.isPending}
            >
              Enviar lembrete
            </Button>
          </S.Acoes>
        </S.Cabecalho>

        <S.AbasWrap>
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 1 }}>
            <Tabs value={aba} onChange={(_e, v: Aba) => setAba(v)} variant="scrollable" allowScrollButtonsMobile>
              {ABAS.map((a) => (
                <Tab key={a.id} value={a.id} label={a.label} sx={{ textTransform: "none" }} />
              ))}
            </Tabs>
          </Box>
          {atualizando && <LinearProgress sx={{ height: 2 }} />}
          <S.AbaConteudo>
            {aba === "geral" && (
              <AbaVisaoGeral dados={dados} onLembrar={enviarLembrete} lembrando={lembrar.isPending} />
            )}
            {aba === "diario" && (
              <AbaDiario
                semana={dados.semana}
                onSemana={setSemana}
                onLembrar={enviarLembrete}
                lembrando={lembrar.isPending}
                ativo={professor.ativo}
              />
            )}
            {aba === "notas" && (
              <AbaNotas avaliacoes={dados.avaliacoes} periodo={dados.periodo} mediaMinima={dados.mediaMinima} />
            )}
            {aba === "anotacoes" && <AbaAnotacoes anotacoes={dados.anotacoes} />}
          </S.AbaConteudo>
        </S.AbasWrap>
      </S.Page>
    </PageScaffold>
  );
}
