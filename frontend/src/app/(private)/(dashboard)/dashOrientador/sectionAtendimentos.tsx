"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@mui/material";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { RoutesEnum } from "@/enums";
import { PERFIL_DISPLAY_NAME } from "@/enums/PerfilNomeEnum";
import { ConversaResponse } from "@/services/domains/conversa/response";
import * as S from "./styles";

interface SectionAtendimentosProps {
  atendimentos: ConversaResponse[];
  loading: boolean;
}

function formatarData(isoString: string): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function IconeRemetente({ perfilNome }: { perfilNome: string }) {
  if (perfilNome === "PROFESSOR") return <SchoolOutlinedIcon />;
  if (perfilNome === "ESTUDANTE") return <PersonOutlineOutlinedIcon />;
  return <ChatBubbleOutlineOutlinedIcon />;
}

export default function SectionAtendimentos({ atendimentos, loading }: SectionAtendimentosProps) {
  const router = useRouter();
  const naoLidos = atendimentos.filter((a) => a.mensagensNaoLidas > 0).length;

  return (
    <S.PanelCard>
      <S.PanelHeader>
        <S.PanelTitleGroup>
          <S.PanelTitle>Atendimentos recentes</S.PanelTitle>
          {naoLidos > 0 && <S.CountBadge>{naoLidos}</S.CountBadge>}
        </S.PanelTitleGroup>
        <S.LinkButton type="button" onClick={() => router.push(RoutesEnum.COMUNICACAO)}>
          Abrir fila
        </S.LinkButton>
      </S.PanelHeader>

      {loading ? (
        <Skeleton variant="rounded" height={150} />
      ) : atendimentos.length === 0 ? (
        <S.EmptyHint>Nenhum atendimento dirigido à Orientação até agora.</S.EmptyHint>
      ) : (
        <S.RowList>
          {atendimentos.map((atendimento) => (
            <S.Row
              key={atendimento.id}
              type="button"
              onClick={() => router.push(RoutesEnum.COMUNICACAO)}
            >
              <S.RowIcon>
                <IconeRemetente perfilNome={atendimento.remetentePerfilNome} />
              </S.RowIcon>
              <S.RowBody>
                <S.RowTitle>{atendimento.titulo}</S.RowTitle>
                <S.RowMeta>
                  {atendimento.remetenteNome} ·{" "}
                  {PERFIL_DISPLAY_NAME[atendimento.remetentePerfilNome] ??
                    atendimento.remetentePerfilNome}{" "}
                  · {formatarData(atendimento.criadoEm)}
                </S.RowMeta>
              </S.RowBody>
              <S.RowAside>
                {atendimento.mensagensNaoLidas > 0 && (
                  <S.UnreadDot>
                    {atendimento.mensagensNaoLidas > 99 ? "99+" : atendimento.mensagensNaoLidas}
                  </S.UnreadDot>
                )}
                <S.StatusTag $tone={atendimento.status === "ABERTA" ? "open" : "closed"}>
                  {atendimento.status === "ABERTA" ? "Aberto" : "Encerrado"}
                </S.StatusTag>
              </S.RowAside>
            </S.Row>
          ))}
        </S.RowList>
      )}
    </S.PanelCard>
  );
}
