"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useDocumentacaoAluno } from "@/hooks/useDocumentacaoAluno";
import { useDocumentoMutations } from "@/hooks/useDocumentoMutations";
import {
  DocumentacaoPessoaResponse,
  DocumentoResponse,
  ItemChecklistDocumentoResponse,
} from "@/services/domains/documento";
import ChecklistDocumentacao, { AcaoItem } from "./ChecklistDocumentacao";
import EnviarDocumentoDialog from "./EnviarDocumentoDialog";
import ValidarDocumentoDialog from "./ValidarDocumentoDialog";

interface DocumentacaoAlunoDialogProps {
  open: boolean;
  alunoId: number | null;
  alunoNome?: string;
  onClose: () => void;
}

type Envio = { pessoa: DocumentacaoPessoaResponse; item: ItemChecklistDocumentoResponse };
type Validacao = { pessoa: DocumentacaoPessoaResponse; documento: DocumentoResponse };

/** Checklist de documentos do aluno e responsáveis, com envio e validação pela escola. */
export default function DocumentacaoAlunoDialog({
  open,
  alunoId,
  alunoNome,
  onClose,
}: DocumentacaoAlunoDialogProps) {
  const { documentacao, loading, error } = useDocumentacaoAluno(open ? alunoId : null);
  const { enviar, atualizarFoto } = useDocumentoMutations();
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [validacao, setValidacao] = useState<Validacao | null>(null);

  function acoesDoItem(
    pessoa: DocumentacaoPessoaResponse,
    item: ItemChecklistDocumentoResponse,
  ): AcaoItem[] {
    const abrirEnvio = () => setEnvio({ pessoa, item });
    switch (item.situacao) {
      case "PENDENTE":
        return [{ label: "Enviar", onClick: abrirEnvio, variant: "outlined" }];
      case "EM_ANALISE":
        return [
          {
            label: "Validar",
            onClick: () => setValidacao({ pessoa, documento: item.documento! }),
            variant: "contained",
          },
        ];
      case "REJEITADO":
        return [{ label: "Reenviar", onClick: abrirEnvio, variant: "outlined" }];
      default:
        return [{ label: "Substituir", onClick: abrirEnvio }];
    }
  }

  const substituindoAprovado = envio?.item.situacao === "APROVADO";

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Documentos{alunoNome ? ` de ${alunoNome}` : ""}</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error || !documentacao ? (
            <Alert severity="error">{error ?? "Não foi possível carregar os documentos."}</Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert severity={documentacao.completa ? "success" : "warning"}>
                {documentacao.completa
                  ? "Todos os documentos obrigatórios foram aprovados."
                  : "Há documentos obrigatórios pendentes, em análise ou vencidos."}
              </Alert>
              <ChecklistDocumentacao
                pessoas={documentacao.pessoas}
                acoesDoItem={acoesDoItem}
                onTrocarFoto={(pessoa, foto) =>
                  atualizarFoto.mutate({ dadosPessoaisId: pessoa.dadosPessoaisId, foto })
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <EnviarDocumentoDialog
        open={!!envio}
        titulo={envio ? `${envio.item.descricao} de ${envio.pessoa.nome}` : ""}
        aviso={
          substituindoAprovado
            ? "Este documento já foi aprovado. O novo envio volta para análise."
            : undefined
        }
        enviando={enviar.isPending}
        onClose={() => setEnvio(null)}
        onEnviar={(arquivos) =>
          enviar.mutateAsync({
            dadosPessoaisId: envio!.pessoa.dadosPessoaisId,
            tipo: envio!.item.tipo,
            arquivos,
          })
        }
      />

      <ValidarDocumentoDialog
        open={!!validacao}
        documento={validacao?.documento ?? null}
        nomePessoa={validacao?.pessoa.nome}
        onClose={() => setValidacao(null)}
      />
    </>
  );
}
