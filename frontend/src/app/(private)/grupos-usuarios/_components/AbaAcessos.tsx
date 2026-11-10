"use client";

import { useGrupoUsuarioMutations } from "@/hooks/useGrupoUsuarioMutations";
import { GrupoUsuarioDetalheResponse } from "@/services/domains/grupo-usuario";
import EditorAcessos from "./EditorAcessos";

interface AbaAcessosProps {
  grupo: GrupoUsuarioDetalheResponse;
}

export default function AbaAcessos({ grupo }: AbaAcessosProps) {
  const { salvarAcessos } = useGrupoUsuarioMutations();

  return (
    <EditorAcessos
      perfil={grupo.perfil}
      salvos={[...grupo.telas, ...grupo.controles]}
      salvando={salvarAcessos.isPending}
      onSalvar={(dados) => salvarAcessos.mutate({ id: grupo.id, dados })}
    />
  );
}
