import { Alert } from "@mui/material";

/**
 * Enquanto as fases F2/F3 da spec não entram, o sistema ainda libera as telas
 * pelo perfil. Sem este aviso, a escola acharia que restringiu alguém.
 */
export default function AvisoPermissoesInativas() {
  return (
    <Alert severity="warning" sx={{ mb: 3 }}>
      Os acessos configurados aqui ainda não estão em vigor. Por enquanto, cada pessoa continua
      vendo as telas pelo perfil dela.
    </Alert>
  );
}
