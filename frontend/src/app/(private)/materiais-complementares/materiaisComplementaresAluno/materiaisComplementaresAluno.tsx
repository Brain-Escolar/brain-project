"use client";

import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useMateriaisComplementaresAluno } from "@/hooks/useMateriaisComplementaresAluno";
import { useContextoAluno } from "@/hooks/useContextoAluno";
import { MaterialComplementarResponse } from "@/services/domains/material-complementar";
import { getDisciplinaIcon } from "@/utils/disciplinaUtils";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import { Box, Chip } from "@mui/material";
import { useMemo, useState } from "react";
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
  const { alunoId, pronto } = useContextoAluno();
  const { materiais, loading } = useMateriaisComplementaresAluno(alunoId, pronto);
  // null = todas as disciplinas
  const [disciplinaFiltro, setDisciplinaFiltro] = useState<number | null>(null);

  const disciplinas = useMemo(() => {
    const mapa = new Map<number, string>();
    materiais.forEach((m) => mapa.set(m.disciplinaId, m.disciplinaNome));
    return Array.from(mapa, ([disciplinaId, nomeDisciplina]) => ({ disciplinaId, nomeDisciplina })).sort((a, b) =>
      a.nomeDisciplina.localeCompare(b.nomeDisciplina),
    );
  }, [materiais]);

  // Filtro de uma disciplina que sumiu (ex.: responsável trocou de aluno) vale como "Todas".
  const filtroAtivo = disciplinas.some((d) => d.disciplinaId === disciplinaFiltro) ? disciplinaFiltro : null;
  const disciplinasVisiveis =
    filtroAtivo === null ? disciplinas : disciplinas.filter((d) => d.disciplinaId === filtroAtivo);

  if (loading) return <LoadingComponent />;

  return (
    <PageScaffold
      title="Materiais complementares"
      description="Arquivos e links de apoio compartilhados pelos seus professores."
    >
      {disciplinas.length > 1 && (
        <Box
          role="group"
          aria-label="Filtrar por disciplina"
          sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
        >
          <Chip
            label="Todas"
            clickable
            color={filtroAtivo === null ? "primary" : "default"}
            variant={filtroAtivo === null ? "filled" : "outlined"}
            onClick={() => setDisciplinaFiltro(null)}
          />
          {disciplinas.map((d) => {
            const ativo = filtroAtivo === d.disciplinaId;
            return (
              <Chip
                key={d.disciplinaId}
                label={d.nomeDisciplina}
                clickable
                color={ativo ? "primary" : "default"}
                variant={ativo ? "filled" : "outlined"}
                onClick={() => setDisciplinaFiltro(ativo ? null : d.disciplinaId)}
              />
            );
          })}
        </Box>
      )}

      {disciplinas.length === 0 ? (
        <BrainResultNotFound message="Ainda não há materiais complementares disponíveis para você." />
      ) : (
        disciplinasVisiveis.map((d) => {
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
