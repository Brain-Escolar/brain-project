"use client";

import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useMateriaisComplementaresAluno } from "@/hooks/useMateriaisComplementaresAluno";
import { MaterialComplementarResponse } from "@/services/domains/material-complementar";
import { getDisciplinaIcon } from "@/utils/disciplinaUtils";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import { useMemo } from "react";
import * as S from "../styles";
import { formatFileSize } from "../utils";

function MaterialCard({ material }: { material: MaterialComplementarResponse }) {
  const isLink = material.tipo === "LINK";

  return (
    <S.MatCard>
      <S.MatCardTop>
        <S.MatCardIcon>{isLink ? <LinkRounded /> : <DescriptionRounded />}</S.MatCardIcon>
      </S.MatCardTop>
      <S.MatCardTitle>{material.titulo}</S.MatCardTitle>
      {material.descricao && <S.MatCardDesc>{material.descricao}</S.MatCardDesc>}
      <S.MatCardMeta>
        <span>{isLink ? material.dominio : formatFileSize(material.arquivo?.tamanho ?? 0)}</span>
      </S.MatCardMeta>
      <S.MatCardFoot>
        {isLink ? (
          <S.MatCardOpen href={material.url ?? "#"} target="_blank" rel="noreferrer">
            <OpenInNewRounded />
            Abrir link
          </S.MatCardOpen>
        ) : (
          <S.MatCardOpen href={material.arquivo?.downloadUrl} target="_blank" rel="noreferrer">
            <DownloadRounded />
            Baixar arquivo
          </S.MatCardOpen>
        )}
      </S.MatCardFoot>
    </S.MatCard>
  );
}

export default function MateriaisComplementaresAlunoPage() {
  const { materiais, loading } = useMateriaisComplementaresAluno();

  const disciplinas = useMemo(() => {
    const mapa = new Map<number, string>();
    materiais.forEach((m) => mapa.set(m.disciplinaId, m.disciplinaNome));
    return Array.from(mapa, ([disciplinaId, nomeDisciplina]) => ({ disciplinaId, nomeDisciplina })).sort((a, b) =>
      a.nomeDisciplina.localeCompare(b.nomeDisciplina),
    );
  }, [materiais]);

  if (loading) return <LoadingComponent />;

  return (
    <PageScaffold
      title="Materiais complementares"
      description="Arquivos e links de apoio compartilhados pelos seus professores."
    >
      {disciplinas.length === 0 ? (
        <BrainResultNotFound message="Ainda não há materiais complementares disponíveis para você." />
      ) : (
        disciplinas.map((d) => {
          const DisciplinaIcon = getDisciplinaIcon(d.nomeDisciplina);
          const itens = materiais.filter((m) => m.disciplinaId === d.disciplinaId);
          return (
            <S.DiscSection key={d.disciplinaId}>
              <S.DiscHead>
                <S.DiscTitleWrap>
                  <S.DiscIcon>
                    <DisciplinaIcon />
                  </S.DiscIcon>
                  <div>
                    <S.DiscName>{d.nomeDisciplina}</S.DiscName>
                    <S.DiscCount>
                      {itens.length} material{itens.length === 1 ? "" : "is"}
                    </S.DiscCount>
                  </div>
                </S.DiscTitleWrap>
              </S.DiscHead>

              <S.MatGrid>
                {itens.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
              </S.MatGrid>
            </S.DiscSection>
          );
        })
      )}
    </PageScaffold>
  );
}
