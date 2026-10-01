import { CSSProperties, forwardRef, ReactNode } from "react";

/*
 * Folha A4 (794 × 1123 px a 96 dpi) dos documentos escolares. Estilos inline e
 * cores fixas de papel de propósito: a folha é clonada para a impressão e não
 * deve depender do tema (claro/escuro) nem de classes da página.
 */

export const LARGURA_FOLHA = 794;
export const ALTURA_FOLHA = 1123;

export const COR = {
  texto: "#141414",
  secundario: "#475569",
  rotulo: "#64748B",
  apagado: "#94A3B8",
  borda: "#CBD5E1",
  bordaLeve: "#E2E8F0",
  cabecalho: "#EEF2FB",
  fundoLeve: "#F8FAFC",
  primaria: "#1E4BC8",
  erro: "#B42318",
};

const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

export const estiloRotulo: CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  color: COR.rotulo,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export const estiloTituloSecao: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: "#334155",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export const estiloNumero: CSSProperties = {
  fontFamily: MONO,
  fontVariantNumeric: "tabular-nums",
};

export interface CampoIdentificacao {
  rotulo: string;
  valor: string;
  largo?: boolean;
}

interface FolhaDocumentoProps {
  escolaNome: string;
  escolaLinhas: string[];
  titulo: string;
  subtitulo: string;
  identificacao: CampoIdentificacao[];
  observacoes: string[];
  assinaturas: { nome: string; cargo: string }[] | null;
  rodape: string;
  children: ReactNode;
}

const FolhaDocumento = forwardRef<HTMLDivElement, FolhaDocumentoProps>(function FolhaDocumento(
  {
    escolaNome,
    escolaLinhas,
    titulo,
    subtitulo,
    identificacao,
    observacoes,
    assinaturas,
    rodape,
    children,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        width: LARGURA_FOLHA,
        minHeight: ALTURA_FOLHA,
        boxSizing: "border-box",
        background: "#fff",
        color: COR.texto,
        padding: "40px 52px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
        fontSize: 12,
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          paddingBottom: 14,
          borderBottom: `2px solid ${COR.primaria}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {escolaNome}
          </span>
          {escolaLinhas.map((linha) => (
            <span key={linha} style={{ fontSize: 11, color: COR.secundario }}>
              {linha}
            </span>
          ))}
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{titulo}</span>
          <span style={{ fontSize: 11, color: COR.secundario }}>{subtitulo}</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "10px 18px",
        }}
      >
        {identificacao.map((campo) => (
          <div key={campo.rotulo} style={campo.largo ? { gridColumn: "span 2" } : undefined}>
            <div style={estiloRotulo}>{campo.rotulo}</div>
            <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>{campo.valor}</div>
          </div>
        ))}
      </div>

      {children}

      {observacoes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={estiloTituloSecao}>Observações</span>
          {observacoes.map((obs, i) => (
            <span key={i} style={{ fontSize: 11, color: "#1E293B", whiteSpace: "pre-wrap" }}>
              {obs}
            </span>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {assinaturas && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${assinaturas.length}, 1fr)`,
            gap: 48,
            padding: "14px 24px 0",
          }}
        >
          {assinaturas.map((a) => (
            <div
              key={a.cargo}
              style={{ borderTop: `1px solid ${COR.texto}`, paddingTop: 6, textAlign: "center" }}
            >
              <div style={{ fontSize: 11.5, fontWeight: 600, minHeight: 16 }}>{a.nome}</div>
              <div style={{ fontSize: 10, color: COR.secundario }}>{a.cargo}</div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          borderTop: `1px solid ${COR.bordaLeve}`,
          paddingTop: 10,
          fontSize: 9.5,
          color: COR.rotulo,
        }}
      >
        <span>{rodape}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Emitido via
          {/* eslint-disable-next-line @next/next/no-img-element -- precisa ir junto no clone da impressão */}
          <img src="/brand/logo/brain-wordmark-azul.svg" alt="Brain" style={{ height: 13 }} />
        </span>
      </div>
    </div>
  );
});

export default FolhaDocumento;

/** Tabela com bordas arredondadas no estilo da folha. */
export function TabelaFolha({ children }: { children: ReactNode }) {
  return (
    <div style={{ border: `1px solid ${COR.borda}`, borderRadius: 6, overflow: "hidden" }}>
      {children}
    </div>
  );
}
