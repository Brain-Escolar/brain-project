"use client";

import { useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import ChecklistDocumentacao, { AcaoItem } from "@/components/documentacao/ChecklistDocumentacao";
import EnviarDocumentoDialog from "@/components/documentacao/EnviarDocumentoDialog";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";
import { useDocumentacaoResponsavel } from "@/hooks/useDocumentacaoResponsavel";
import {
  DocumentacaoPessoaResponse,
  ItemChecklistDocumentoResponse,
} from "@/services/domains/documento";
import { useDocumentosResponsavelMutations } from "./useDocumentosResponsavelMutations";

type Envio = { pessoa: DocumentacaoPessoaResponse; item: ItemChecklistDocumentoResponse };

export default function DocumentosResponsavelPage() {
  const { alunoAtual, alunoId, isLoading: carregandoAlunos } = useAlunoSelecionado();
  const { documentacao, loading, error } = useDocumentacaoResponsavel();
  const { enviar, atualizarFoto } = useDocumentosResponsavelMutations(alunoId);
  const [envio, setEnvio] = useState<Envio | null>(null);

  if (carregandoAlunos || loading) return <LoadingComponent />;
  if (!alunoAtual) {
    return <BrainResultNotFound message="Nenhum aluno vinculado ao seu cadastro." />;
  }
  if (error || !documentacao) {
    return <BrainResultNotFound message="Não foi possível carregar os documentos deste aluno." />;
  }

  const primeiroNome = (alunoAtual.nomeSocial || alunoAtual.nome || "").split(" ")[0];

  /**
   * A família envia o que falta, corrige o que foi rejeitado ou venceu e pode
   * trocar um envio ainda em análise. Documento aprovado e em dia só a
   * secretaria substitui (o backend também barra).
   */
  function acoesDoItem(
    pessoa: DocumentacaoPessoaResponse,
    item: ItemChecklistDocumentoResponse,
  ): AcaoItem[] {
    const abrirEnvio = () => setEnvio({ pessoa, item });
    switch (item.situacao) {
      case "PENDENTE":
        return [{ label: "Enviar", onClick: abrirEnvio, variant: "contained" }];
      case "REJEITADO":
      case "VENCIDO":
        return [{ label: "Reenviar", onClick: abrirEnvio, variant: "contained" }];
      case "EM_ANALISE":
        return [{ label: "Substituir", onClick: abrirEnvio }];
      default:
        return [];
    }
  }

  const rejeitados = documentacao.pessoas
    .flatMap((p) => p.itens)
    .filter((i) => i.situacao === "REJEITADO").length;

  return (
    <PageScaffold
      title={`Documentos de ${primeiroNome}`}
      description="Documentos necessários para a matrícula. A secretaria confere cada envio."
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {documentacao.completa ? (
          <Alert severity="success">
            Tudo certo! Todos os documentos obrigatórios foram aprovados pela escola.
          </Alert>
        ) : rejeitados > 0 ? (
          <Alert severity="error">
            {rejeitados === 1
              ? "Um documento foi rejeitado. Veja o motivo abaixo e envie novamente."
              : `${rejeitados} documentos foram rejeitados. Veja os motivos abaixo e envie novamente.`}
          </Alert>
        ) : (
          <Alert severity="warning">
            Ainda faltam documentos obrigatórios ou há envios aguardando a conferência da escola.
          </Alert>
        )}

        <ChecklistDocumentacao
          pessoas={documentacao.pessoas}
          acoesDoItem={acoesDoItem}
          podeTrocarFoto={(pessoa) => pessoa.papel === "ALUNO"}
          onTrocarFoto={(_, foto) => atualizarFoto.mutate(foto)}
        />

        <Typography variant="body2" color="text.secondary">
          Envie fotos legíveis ou PDFs, com frente e verso quando houver. Seus documentos pessoais
          (identidade, CPF, comprovante de residência) valem para todos os alunos vinculados a você.
          Para trocar um documento já aprovado, fale com a secretaria.
        </Typography>
      </Box>

      <EnviarDocumentoDialog
        open={!!envio}
        titulo={envio ? `${envio.item.descricao} de ${envio.pessoa.nome}` : ""}
        enviando={enviar.isPending}
        onClose={() => setEnvio(null)}
        onEnviar={(arquivos) =>
          enviar.mutateAsync({ papel: envio!.pessoa.papel, tipo: envio!.item.tipo, arquivos })
        }
      />
    </PageScaffold>
  );
}
