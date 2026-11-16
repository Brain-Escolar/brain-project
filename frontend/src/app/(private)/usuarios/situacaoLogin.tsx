import { Chip } from "@mui/material";
import { MotivoDesativacao, SituacaoLogin } from "@/services/domains/usuario";

export const NOME_SITUACAO: Record<SituacaoLogin, string> = {
  AGUARDANDO_VERIFICACAO: "Aguardando verificação",
  ATIVO: "Ativo",
  DESATIVADO: "Desativado",
};

export const NOME_MOTIVO: Record<MotivoDesativacao, string> = {
  SEM_PERFIL: "ficou sem perfil (desmatrícula ou desligamento)",
  ADMINISTRATIVA: "pela gestão",
};

const COR: Record<SituacaoLogin, "default" | "success" | "warning"> = {
  AGUARDANDO_VERIFICACAO: "warning",
  ATIVO: "success",
  DESATIVADO: "default",
};

export function ChipSituacao({
  situacao,
  motivo,
}: {
  situacao: SituacaoLogin;
  motivo?: MotivoDesativacao | null;
}) {
  const titulo =
    situacao === "DESATIVADO" && motivo ? `Desativado: ${NOME_MOTIVO[motivo]}` : undefined;
  return (
    <Chip
      size="small"
      variant={situacao === "ATIVO" ? "filled" : "outlined"}
      color={COR[situacao]}
      label={NOME_SITUACAO[situacao]}
      title={titulo}
    />
  );
}
