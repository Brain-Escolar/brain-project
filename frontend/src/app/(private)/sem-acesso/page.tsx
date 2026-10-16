"use client";

import { Alert, Typography } from "@mui/material";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";

/**
 * Destino de quem não tem nenhuma tela liberada no perfil: está fora de
 * qualquer grupo de acesso, ou num grupo sem telas.
 */
export default function SemAcessoPage() {
  const { precisaSeletor } = usePerfilAtivo();

  return (
    <PageScaffold title="Sem acesso">
      <Alert severity="info">
        <Typography variant="body2">
          Você ainda não tem acesso às telas deste perfil. Fale com a direção da escola para ser
          incluído em um grupo de acesso.
        </Typography>
        {precisaSeletor && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Se você tem outro perfil, troque no seletor de perfil, no topo da tela.
          </Typography>
        )}
      </Alert>
    </PageScaffold>
  );
}
