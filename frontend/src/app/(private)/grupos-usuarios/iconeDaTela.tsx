import { ReactElement } from "react";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import { ROUTES } from "@/constants/routesConfig";
import { RoutesEnum } from "@/enums";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

/**
 * O mesmo ícone que a tela tem no menu. O código da tela é a chave do RoutesEnum,
 * e a mesma rota pode ter ícones diferentes por perfil no routesConfig: vale o
 * da entrada do perfil do grupo.
 */
export function iconeDaTela(codigo: string, perfil: PerfilNomeEnum): ReactElement {
  const rota = RoutesEnum[codigo as keyof typeof RoutesEnum];
  const entradas = ROUTES.filter((entrada) => entrada.router === rota);
  // O DIRETOR já aparece nas entradas do ADMIN (herança no routesConfig).
  const doPerfil = entradas.find((entrada) =>
    entrada.roles.some((role) => (role as string) === perfil),
  );
  return (doPerfil ?? entradas[0])?.icon ?? <WebAssetIcon fontSize="small" />;
}
