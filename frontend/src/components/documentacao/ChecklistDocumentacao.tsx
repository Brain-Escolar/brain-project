"use client";

import { useRef } from "react";
import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import Badge from "@/components/badge";
import {
  DocumentacaoPessoaResponse,
  ItemChecklistDocumentoResponse,
} from "@/services/domains/documento";
import ArquivosDocumento from "./ArquivosDocumento";
import SituacaoDocumentoBadge from "./SituacaoDocumentoBadge";
import { ACCEPT_FOTO, formatarDataLocal, formatarInstante, iniciais } from "./formatadores";

export interface AcaoItem {
  label: string;
  onClick: () => void;
  variant?: "text" | "outlined" | "contained";
}

interface ChecklistDocumentacaoProps {
  pessoas: DocumentacaoPessoaResponse[];
  /** Ações de cada linha — quem usa decide o que a secretaria e a família podem fazer. */
  acoesDoItem: (
    pessoa: DocumentacaoPessoaResponse,
    item: ItemChecklistDocumentoResponse,
  ) => AcaoItem[];
  /** Se informado, mostra o botão de trocar foto para as pessoas em que retornar true. */
  podeTrocarFoto?: (pessoa: DocumentacaoPessoaResponse) => boolean;
  onTrocarFoto?: (pessoa: DocumentacaoPessoaResponse, foto: File) => void;
}

/** Checklist de documentos por pessoa (aluno e responsáveis). Só apresentação. */
export default function ChecklistDocumentacao({
  pessoas,
  acoesDoItem,
  podeTrocarFoto,
  onTrocarFoto,
}: ChecklistDocumentacaoProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {pessoas.map((pessoa) => (
        <CartaoPessoa
          key={pessoa.dadosPessoaisId}
          pessoa={pessoa}
          acoesDoItem={acoesDoItem}
          mostrarFoto={!!onTrocarFoto && (podeTrocarFoto?.(pessoa) ?? true)}
          onTrocarFoto={onTrocarFoto}
        />
      ))}
    </Box>
  );
}

function CartaoPessoa({
  pessoa,
  acoesDoItem,
  mostrarFoto,
  onTrocarFoto,
}: {
  pessoa: DocumentacaoPessoaResponse;
  acoesDoItem: ChecklistDocumentacaoProps["acoesDoItem"];
  mostrarFoto: boolean;
  onTrocarFoto?: ChecklistDocumentacaoProps["onTrocarFoto"];
}) {
  const inputFoto = useRef<HTMLInputElement>(null);
  const papel =
    pessoa.papel === "ALUNO"
      ? "Aluno"
      : pessoa.responsavelFinanceiro
        ? "Responsável financeiro"
        : "Responsável";

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
        <Avatar src={pessoa.fotoUrl ?? undefined} sx={{ width: 44, height: 44, fontSize: 14 }}>
          {iniciais(pessoa.nome ?? "")}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {pessoa.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {papel}
          </Typography>
        </Box>
        <Badge $tone={pessoa.completa ? "success" : "warning"}>
          {pessoa.completa ? "Documentação completa" : "Documentação pendente"}
        </Badge>
        {mostrarFoto && onTrocarFoto && (
          <>
            <input
              ref={inputFoto}
              type="file"
              accept={ACCEPT_FOTO}
              style={{ display: "none" }}
              onChange={(e) => {
                const foto = e.target.files?.[0];
                if (foto) onTrocarFoto(pessoa, foto);
                e.target.value = "";
              }}
            />
            <Button
              size="small"
              startIcon={<PhotoCameraOutlinedIcon fontSize="small" />}
              onClick={() => inputFoto.current?.click()}
            >
              {pessoa.fotoUrl ? "Trocar foto" : "Enviar foto"}
            </Button>
          </>
        )}
      </Box>

      {pessoa.itens.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhum documento exigido.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {pessoa.itens.map((item) => (
            <LinhaItem key={item.tipo} item={item} acoes={acoesDoItem(pessoa, item)} />
          ))}
        </Box>
      )}
    </Paper>
  );
}

function LinhaItem({ item, acoes }: { item: ItemChecklistDocumentoResponse; acoes: AcaoItem[] }) {
  const documento = item.documento;
  const validade = formatarDataLocal(documento?.dataValidade);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
        py: 1.25,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="body2" fontWeight={600}>
            {item.descricao}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.obrigatorio ? "Obrigatório" : "Opcional"}
          </Typography>
        </Box>
        {documento?.status === "REJEITADO" && documento.motivoRejeicao && (
          <Typography variant="caption" color="error.main">
            Motivo: {documento.motivoRejeicao}
          </Typography>
        )}
        {documento && (
          <Typography variant="caption" color="text.secondary">
            Enviado em {formatarInstante(documento.enviadoEm)}
            {documento.validadoPor && documento.status !== "EM_ANALISE"
              ? ` · validado por ${documento.validadoPor}`
              : ""}
            {validade ? ` · válido até ${validade}` : ""}
          </Typography>
        )}
        {documento && <ArquivosDocumento arquivos={documento.arquivos} />}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
        <SituacaoDocumentoBadge situacao={item.situacao} />
        {acoes.map((acao) => (
          <Button
            key={acao.label}
            size="small"
            variant={acao.variant ?? "text"}
            onClick={acao.onClick}
          >
            {acao.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
