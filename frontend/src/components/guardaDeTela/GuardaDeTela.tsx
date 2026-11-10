"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Alert, Button } from "@mui/material";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import { codigoDaTela, findRouteByPath, rotaPermitidaDoPerfil } from "@/constants/routesConfig";
import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";
import { usePermissoes } from "@/hooks/usePermissoes";

/**
 * Guarda de rota por permissão (docs/permissoes.md, seção 9.3).
 *
 * O middleware já barrou quem não tem o perfil da rota; aqui fica quem tem o
 * perfil, mas não tem a tela liberada em nenhum grupo. A rota é resolvida pelo
 * prefixo mais longo (findRouteByPath), então /comunicados/cadastro é checada
 * como a tela de cadastro, e não como /comunicados.
 *
 * Rota livre, ou que não está no routesConfig, passa direto.
 */
export default function GuardaDeTela({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { perfilAtivo } = usePerfilAtivo();
  const { carregando, erro, podeTelaEmAlgumPerfil, podeVerRota, recarregar } = usePermissoes();

  const rota = findRouteByPath(pathname);
  const codigo = rota && !rota.livre ? codigoDaTela(rota) : undefined;
  const bloqueada = !!codigo && !carregando && !erro && !podeTelaEmAlgumPerfil(codigo);

  useEffect(() => {
    if (bloqueada && perfilAtivo) {
      router.replace(rotaPermitidaDoPerfil(perfilAtivo, podeVerRota));
    }
  }, [bloqueada, perfilAtivo, podeVerRota, router]);

  if (!codigo) return <>{children}</>;

  // Sem a resposta, não dá para saber o que liberar. Bloquear tudo por uma
  // falha de rede seria pior que mostrar o erro e deixar tentar de novo.
  if (erro) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={recarregar}>
            Tentar de novo
          </Button>
        }
      >
        Não foi possível carregar suas permissões.
      </Alert>
    );
  }

  // Enquanto carrega (ou já redirecionando), a tela não aparece nem por um instante.
  if (carregando || bloqueada) return <LoadingComponent />;

  return <>{children}</>;
}
