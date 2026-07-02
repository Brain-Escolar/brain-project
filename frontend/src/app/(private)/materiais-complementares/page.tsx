"use client";

import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useMateriaisComplementares } from "@/hooks/useMateriaisComplementares";
import { useMinhasTurmas } from "@/hooks/useMinhasTurmas";
import { MaterialComplementarResponse } from "@/services/domains/material-complementar";
import { getDisciplinaIcon } from "@/utils/disciplinaUtils";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import { Button, IconButton } from "@mui/material";
import { useState } from "react";
import ModalAdicionarMaterial from "./components/ModalAdicionarMaterial";
import * as S from "./styles";
import { formatFileSize } from "./utils";
import { useMaterialComplementarMutations } from "./useMaterialComplementarMutations";

function MaterialCard({ material }: { material: MaterialComplementarResponse }) {
  const { deleteMaterial } = useMaterialComplementarMutations();
  const isLink = material.tipo === "LINK";

  return (
    <S.MatCard>
      <S.MatCardTop>
        <S.MatCardIcon>{isLink ? <LinkRounded /> : <DescriptionRounded />}</S.MatCardIcon>
        <IconButton
          size="small"
          aria-label="Remover material"
          onClick={() => deleteMaterial.mutate(material.id)}
          disabled={deleteMaterial.isPending}
        >
          <DeleteOutlineRounded fontSize="small" />
        </IconButton>
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

export default function MateriaisComplementaresPage() {
  const { materiais, loading: loadingMateriais } = useMateriaisComplementares();
  const { disciplinas, loading: loadingDisciplinas } = useMinhasTurmas();
  const [modalDisciplinaId, setModalDisciplinaId] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  function abrirModal(disciplinaId?: number) {
    setModalDisciplinaId(disciplinaId);
    setModalOpen(true);
  }

  if (loadingMateriais || loadingDisciplinas) return <LoadingComponent />;

  return (
    <PageScaffold
      title="Materiais complementares"
      description="Compartilhe arquivos e links de apoio para cada disciplina que você leciona."
      actions={
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => abrirModal()}>
          Adicionar material
        </Button>
      }
    >
      {disciplinas.length === 0 ? (
        <BrainResultNotFound message="Você ainda não leciona nenhuma disciplina." />
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
                <S.AddBtn onClick={() => abrirModal(d.disciplinaId)}>
                  <AddRounded />
                  Adicionar
                </S.AddBtn>
              </S.DiscHead>

              {itens.length === 0 ? (
                <S.EmptyDisc>Nenhum material adicionado para {d.nomeDisciplina} ainda.</S.EmptyDisc>
              ) : (
                <S.MatGrid>
                  {itens.map((m) => (
                    <MaterialCard key={m.id} material={m} />
                  ))}
                </S.MatGrid>
              )}
            </S.DiscSection>
          );
        })
      )}

      <ModalAdicionarMaterial
        open={modalOpen}
        disciplinas={disciplinas}
        defaultDisciplinaId={modalDisciplinaId}
        onClose={() => setModalOpen(false)}
      />
    </PageScaffold>
  );
}
