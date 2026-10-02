"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import { TipoDocumentoEscolar } from "@/services/domains/documento-escolar";
import EmissaoDocumentos from "./_components/EmissaoDocumentos";
import ValidacaoDocumentos from "./_components/ValidacaoDocumentos";

type Aba = "emitir" | "validar";

const DESCRICAO: Record<Aba, string> = {
  emitir: "Emita boletim e histórico escolar dos alunos, confira a prévia e exporte em PDF.",
  validar: "Valide os documentos de matrícula enviados pela secretaria e pelas famílias.",
};

/**
 * Documentos da secretaria: emissão de boletim/histórico e a fila de validação
 * dos documentos de matrícula. Aceita `?aba=validar` e, para a emissão,
 * `?alunoId=…&tipo=boletim|historico` (atalho vindo da ficha do aluno).
 */
function DocumentosPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const aba: Aba = searchParams.get("aba") === "validar" ? "validar" : "emitir";
  const alunoIdParam = Number(searchParams.get("alunoId"));
  const alunoId = Number.isFinite(alunoIdParam) && alunoIdParam > 0 ? alunoIdParam : null;
  const tipo: TipoDocumentoEscolar =
    searchParams.get("tipo") === "historico" ? "historico" : "boletim";

  function trocarAba(nova: Aba) {
    const params = new URLSearchParams(searchParams.toString());
    if (nova === "emitir") params.delete("aba");
    else params.set("aba", nova);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <PageScaffold title="Documentos" description={DESCRICAO[aba]}>
      <Box sx={{ mb: 2.5 }}>
        <SegmentedControl
          ariaLabel="Seção de documentos"
          value={aba}
          onChange={trocarAba}
          options={[
            { value: "emitir", label: "Emitir documentos" },
            { value: "validar", label: "Validação de matrícula" },
          ]}
        />
      </Box>

      {aba === "emitir" ? (
        <EmissaoDocumentos alunoIdInicial={alunoId} tipoInicial={tipo} />
      ) : (
        <ValidacaoDocumentos />
      )}
    </PageScaffold>
  );
}

export default function DocumentosPage() {
  return (
    <Suspense
      fallback={
        <PageScaffold>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </PageScaffold>
      }
    >
      <DocumentosPageContent />
    </Suspense>
  );
}
