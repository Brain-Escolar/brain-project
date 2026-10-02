"use client";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import MarkChatUnreadOutlinedIcon from "@mui/icons-material/MarkChatUnreadOutlined";
import { Skeleton } from "@mui/material";
import { IndicadoresOrientacaoResponse } from "@/services/domains/orientacao";
import * as S from "./styles";

interface SectionIndicadoresProps {
  indicadores?: IndicadoresOrientacaoResponse;
  loading: boolean;
}

interface Indicador {
  chave: string;
  valor: number;
  label: string;
  icone: React.ReactNode;
  tone: S.IndicadorTone;
}

function montarIndicadores(dados: IndicadoresOrientacaoResponse): Indicador[] {
  return [
    {
      chave: "alunosMatriculados",
      valor: dados.alunosMatriculados,
      label: `Alunos matriculados · ${dados.turmas} turmas`,
      icone: <GroupsOutlinedIcon />,
      tone: "positive",
    },
    {
      chave: "alunosSemTurma",
      valor: dados.alunosSemTurma,
      // Matrícula incompleta é pendência: só ganha destaque quando existe.
      label: "Alunos sem turma",
      icone: <PersonOffOutlinedIcon />,
      tone: dados.alunosSemTurma > 0 ? "attention" : "neutral",
    },
    {
      chave: "atendimentosAbertos",
      valor: dados.atendimentosAbertos,
      label: "Atendimentos abertos",
      icone: <ForumOutlinedIcon />,
      tone: dados.atendimentosAbertos > 0 ? "positive" : "neutral",
    },
    {
      chave: "atendimentosNaoLidos",
      valor: dados.atendimentosNaoLidos,
      label: "Aguardando sua resposta",
      icone: <MarkChatUnreadOutlinedIcon />,
      tone: dados.atendimentosNaoLidos > 0 ? "attention" : "neutral",
    },
  ];
}

export default function SectionIndicadores({ indicadores, loading }: SectionIndicadoresProps) {
  if (loading || !indicadores) {
    return (
      <S.IndicadorGrid>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={78} sx={{ borderRadius: "18px" }} />
        ))}
      </S.IndicadorGrid>
    );
  }

  return (
    <S.IndicadorGrid>
      {montarIndicadores(indicadores).map((indicador) => (
        <S.IndicadorCard key={indicador.chave}>
          <S.IndicadorIcon $tone={indicador.tone}>{indicador.icone}</S.IndicadorIcon>
          <S.IndicadorBody>
            <S.IndicadorValor>{indicador.valor}</S.IndicadorValor>
            <S.IndicadorLabel>{indicador.label}</S.IndicadorLabel>
          </S.IndicadorBody>
        </S.IndicadorCard>
      ))}
    </S.IndicadorGrid>
  );
}
