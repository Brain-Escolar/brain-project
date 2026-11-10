"use client";

import { ReactNode } from "react";
import { usePermissoes } from "@/hooks/usePermissoes";

interface PermissaoProps {
  /** Código do controle (ex.: CONTROLES.ALUNO_EDITAR). */
  controle?: string;
  /** Código da tela (chave do RoutesEnum). */
  tela?: string;
  children: ReactNode;
  /** O que mostrar sem a permissão. Por padrão, nada. */
  fallback?: ReactNode;
}

/**
 * Mostra o conteúdo só para quem tem a permissão, no perfil ativo:
 *
 *   <Permissao controle={CONTROLES.ALUNO_EXCLUIR}>
 *     <Button>Excluir</Button>
 *   </Permissao>
 */
export default function Permissao({ controle, tela, children, fallback = null }: PermissaoProps) {
  const { podeControle, podeTela } = usePermissoes();
  const liberado = (!controle || podeControle(controle)) && (!tela || podeTela(tela));
  return <>{liberado ? children : fallback}</>;
}
