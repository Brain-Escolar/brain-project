"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled, { css } from "styled-components";

export type Tom = "primary" | "success" | "warning" | "error" | "info" | "neutral";

const tomBg: Record<Tom, string> = {
  primary: cssVarColor("primarySubtle"),
  success: cssVarColor("successSubtle"),
  warning: cssVarColor("warningSubtle"),
  error: cssVarColor("errorSubtle"),
  info: cssVarColor("infoSubtle"),
  neutral: cssVarColor("surfaceSunken"),
};

const tomFg: Record<Tom, string> = {
  primary: cssVarColor("primary"),
  success: cssVarColor("successText"),
  warning: cssVarColor("warningText"),
  error: cssVarColor("errorText"),
  info: cssVarColor("infoText"),
  neutral: cssVarColor("textSecondary"),
};

/** Cor sólida (pontos e barras). */
const tomSolido: Record<Tom, string> = {
  primary: cssVarColor("primary"),
  success: cssVarColor("success"),
  warning: cssVarColor("warning"),
  error: cssVarColor("error"),
  info: cssVarColor("primary"),
  neutral: cssVarColor("border"),
};

const rotuloMaiusculo = css`
  font-size: 11px;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textTertiary")};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const cartao = css`
  border-radius: ${cssVarRadius("xl")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

export const Acoes = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

/* ─── KPIs ───────────────────────────────────────────────────────────────── */

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
`;

export const Kpi = styled.div`
  ${cartao}
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  min-width: 0;
`;

export const KpiTopo = styled.div`
  ${rotuloMaiusculo}
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: ${cssVarColor("textSecondary")};
`;

export const KpiIcone = styled.span<{ $tom: Tom }>`
  width: 36px;
  height: 36px;
  border-radius: ${cssVarRadius("md")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $tom }) => tomBg[$tom]};
  color: ${({ $tom }) => tomFg[$tom]};

  svg {
    font-size: 20px;
  }
`;

export const KpiValor = styled.div`
  font-size: 28px;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

export const KpiNota = styled.div`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
`;

/* ─── Filtros ────────────────────────────────────────────────────────────── */

export const Painel = styled.div`
  ${cartao}
  padding: 18px;
  display: grid;
  grid-template-columns: minmax(240px, 2fr) repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  align-items: end;

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/* ─── Tabelas ────────────────────────────────────────────────────────────── */

export const TabelaWrap = styled.div`
  ${cartao}
  border-radius: ${cssVarRadius("lg")};
  overflow: hidden;
`;

export const Rolagem = styled.div`
  overflow-x: auto;
`;

export const Tabela = styled.table<{ $clicavel?: boolean }>`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-size: ${cssVarFontSize("body2")};

  th {
    ${rotuloMaiusculo}
    color: ${cssVarColor("textSecondary")};
    text-align: left;
    padding: 11px 16px;
    border-bottom: 1px solid ${cssVarColor("borderSubtle")};
    background: ${cssVarColor("surfaceSunken")};
    white-space: nowrap;
  }

  td {
    padding: 10px 16px;
    border-bottom: 1px solid ${cssVarColor("borderSubtle")};
    vertical-align: middle;
    color: ${cssVarColor("text")};
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  ${({ $clicavel }) =>
    $clicavel &&
    css`
      tbody tr {
        cursor: pointer;
        transition: background 0.15s ease;
      }

      tbody tr:hover {
        background: ${cssVarColor("backgroundHover")};
      }
    `}
`;

export const Num = styled.td<{ $direita?: boolean; $suave?: boolean }>`
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  ${({ $direita }) => $direita && "text-align: right;"}
  ${({ $suave }) => $suave && `color: ${cssVarColor("textTertiary")} !important;`}
`;

export const Rodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-top: 1px solid ${cssVarColor("borderSubtle")};
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
`;

export const Legenda = styled.span`
  display: inline-flex;
  gap: 14px;
  flex-wrap: wrap;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
`;

export const Vazio = styled.div`
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;

  svg {
    font-size: 34px;
    color: ${cssVarColor("textTertiary")};
  }

  strong {
    font-size: ${cssVarFontSize("body1")};
    color: ${cssVarColor("text")};
  }

  span {
    font-size: ${cssVarFontSize("body2")};
    color: ${cssVarColor("textSecondary")};
  }
`;

export const PessoaCelula = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  strong {
    display: block;
    font-weight: ${cssVarFontWeight("semibold")};
  }

  small {
    display: block;
    font-size: 12px;
    color: ${cssVarColor("textTertiary")};
    margin-top: 2px;
  }
`;

export const Iniciais = styled.span<{ $grande?: boolean }>`
  width: ${({ $grande }) => ($grande ? 56 : 34)}px;
  height: ${({ $grande }) => ($grande ? 56 : 34)}px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $grande }) => ($grande ? 18 : 12)}px;
  font-weight: ${cssVarFontWeight("semibold")};
  flex-shrink: 0;
`;

export const Selo = styled.span<{ $tom: Tom }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: ${cssVarRadius("pill")};
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  white-space: nowrap;
  background: ${({ $tom }) => tomBg[$tom]};
  color: ${({ $tom }) => tomFg[$tom]};

  svg {
    font-size: 14px;
  }
`;

export const Ponto = styled.span<{ $tom: Tom }>`
  width: 8px;
  height: 8px;
  border-radius: ${cssVarRadius("pill")};
  background: ${({ $tom }) => tomSolido[$tom]};
  flex-shrink: 0;
`;

/** Faixa dos dias da semana na lista: um ponto por dia. */
export const Semana = styled.div`
  display: flex;
  gap: 6px;
`;

export const DiaSemana = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 26px;
  font-size: 10px;
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("textTertiary")};
  text-transform: uppercase;
`;

export const BarraProgresso = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 110px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
  font-variant-numeric: tabular-nums;
`;

export const Trilho = styled.div`
  height: 6px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("surfaceSunken")};
  overflow: hidden;
`;

export const Preenchido = styled.div<{ $pct: number; $tom: Tom }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: inherit;
  background: ${({ $tom }) => tomSolido[$tom]};
`;

export const TextoSuave = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;

/* ─── Detalhe: cabeçalho ─────────────────────────────────────────────────── */

export const Cabecalho = styled.div`
  ${cartao}
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const CabecalhoInfo = styled.div`
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CabecalhoNome = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  h1 {
    margin: 0;
    font-size: ${cssVarFontSize("h4")};
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("text")};
  }
`;

export const Meta = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  svg {
    font-size: 17px;
    color: ${cssVarColor("textTertiary")};
  }
`;

export const AbasWrap = styled.div`
  ${cartao}
  overflow: hidden;
`;

export const AbaConteudo = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;

  @media (max-width: 600px) {
    padding: 14px;
  }
`;

/* ─── Detalhe: visão geral ───────────────────────────────────────────────── */

export const MiniGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

export const Mini = styled.div<{ $tom?: Tom }>`
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  background: ${cssVarColor("surfaceSunken")};
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  > span:first-child {
    ${rotuloMaiusculo}
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  > span:first-child svg {
    font-size: 16px;
  }

  strong {
    font-size: 22px;
    font-weight: ${cssVarFontWeight("semibold")};
    font-variant-numeric: tabular-nums;
    color: ${({ $tom }) => ($tom && $tom !== "neutral" ? tomFg[$tom] : cssVarColor("text"))};
    line-height: 1.1;
  }

  small {
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
  }
`;

export const Aviso = styled.div`
  padding: 14px 16px;
  border-radius: ${cssVarRadius("lg")};
  background: ${cssVarColor("warningSubtle")};
  border: 1px solid ${cssVarColor("warning")};
  color: ${cssVarColor("warningText")};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const AvisoTopo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  > svg {
    font-size: 22px;
  }

  strong {
    flex: 1;
    min-width: 200px;
    font-size: ${cssVarFontSize("body2")};
    font-weight: ${cssVarFontWeight("semibold")};
  }
`;

export const AvisoLista = styled.ul`
  margin: 0;
  padding-left: 32px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: ${cssVarFontSize("small")};
`;

export const SecaoTitulo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};

  svg {
    font-size: 20px;
    color: ${cssVarColor("textTertiary")};
  }

  small {
    margin-left: auto;
    font-size: ${cssVarFontSize("small")};
    font-weight: ${cssVarFontWeight("regular")};
    color: ${cssVarColor("textTertiary")};
  }
`;

/* ─── Detalhe: diário ────────────────────────────────────────────────────── */

export const BarraDiario = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

export const Dias = styled.div`
  flex: 1;
  min-width: 280px;
  display: grid;
  grid-template-columns: auto repeat(5, minmax(0, 1fr)) auto;
  gap: 8px;
  align-items: stretch;

  @media (max-width: 600px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));

    > button:first-child,
    > button:last-child {
      display: none;
    }
  }
`;

export const DiaBotao = styled.button<{ $ativo: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 10px 12px;
  border-radius: ${cssVarRadius("lg")};
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  min-width: 0;
  ${({ $ativo }) =>
    $ativo
      ? css`
          border: 1.5px solid ${cssVarColor("primary")};
          background: ${cssVarColor("primarySubtle")};
        `
      : css`
          border: 1px solid ${cssVarColor("borderSubtle")};
          background: ${cssVarColor("backgroundSection")};
        `}

  > span:first-child {
    ${rotuloMaiusculo}
  }

  strong {
    font-size: ${cssVarFontSize("body2")};
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("text")};
    font-variant-numeric: tabular-nums;
  }

  small {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: ${cssVarColor("textSecondary")};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`;

export const DiaTitulo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;

  strong {
    font-size: ${cssVarFontSize("body1")};
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("text")};
  }

  span {
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
  }
`;

export const AulaCartao = styled.div<{ $pendente: boolean }>`
  border-radius: ${cssVarRadius("lg")};
  background: ${cssVarColor("backgroundSection")};
  overflow: hidden;
  border: ${({ $pendente }) =>
    $pendente ? `1px dashed ${cssVarColor("warning")}` : `1px solid ${cssVarColor("borderSubtle")}`};
`;

export const AulaTopo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: ${cssVarColor("surfaceSunken")};

  > strong {
    font-variant-numeric: tabular-nums;
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("text")};
  }

  > span {
    font-size: ${cssVarFontSize("body2")};
    color: ${cssVarColor("textSecondary")};
  }

  > small {
    margin-left: auto;
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
  }
`;

export const AulaCorpo = styled.div`
  padding: 14px 16px;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(160px, 1fr);
  gap: 14px 20px;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;

  > span:first-child {
    ${rotuloMaiusculo}
  }

  > div {
    font-size: ${cssVarFontSize("body2")};
    color: ${cssVarColor("text")};
    line-height: 1.5;
  }
`;

export const CampoLargo = styled(Campo)`
  grid-column: 1 / -1;
`;

export const AulaPendente = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

/* ─── Detalhe: anotações ─────────────────────────────────────────────────── */

export const Chips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Chip = styled.button<{ $ativo: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: ${cssVarRadius("pill")};
  font-family: inherit;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  cursor: pointer;
  ${({ $ativo }) =>
    $ativo
      ? css`
          border: 1px solid ${cssVarColor("primary")};
          background: ${cssVarColor("primarySubtle")};
          color: ${cssVarColor("primary")};
        `
      : css`
          border: 1px solid ${cssVarColor("border")};
          background: ${cssVarColor("backgroundSection")};
          color: ${cssVarColor("textSecondary")};
        `}

  small {
    font-size: 11px;
    opacity: 0.75;
    font-variant-numeric: tabular-nums;
  }
`;

export const Lista = styled.div`
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  overflow: hidden;
`;

export const AnotacaoLinha = styled.div`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid ${cssVarColor("borderSubtle")};

  &:last-child {
    border-bottom: none;
  }

  > span:first-child {
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
    padding-top: 3px;
    font-variant-numeric: tabular-nums;
  }
`;

export const AnotacaoCorpo = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  > div {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  small {
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
  }

  p {
    margin: 0;
    font-size: ${cssVarFontSize("body2")};
    color: ${cssVarColor("textSecondary")};
    line-height: 1.5;
  }
`;

export const LinkAluno = styled.button`
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  cursor: pointer;

  &:hover {
    color: ${cssVarColor("primary")};
    text-decoration: underline;
  }
`;
