import { Alert } from "@mui/material";

/**
 * Os grupos já decidem o menu e as telas (docs/permissoes.md, F2), mas o
 * servidor ainda não bloqueia as chamadas: quem conhece a API consegue ir além.
 * O aviso evita que a escola trate a restrição como proteção completa.
 */
export default function AvisoPermissoes() {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      Os acessos configurados aqui já valem para o menu e as telas de cada pessoa. O bloqueio também
      no servidor ainda será feito.
    </Alert>
  );
}
