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

export const Painel = styled.div`
  padding: 18px;
  border-radius: ${cssVarRadius("xl")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  ${BrainBoxShadow}
`;

export const Relatorio = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

export const TurmaTitulo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;

  strong {
    font-size: ${cssVarFontSize("h4")};
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("text")};
  }

  span {
    font-size: ${cssVarFontSize("body2")};
    color: ${cssVarColor("textSecondary")};
  }
`;

/* ─── KPIs ───────────────────────────────────────────────────────────────── */

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
`;

export const Kpi = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border-radius: ${cssVarRadius("xl")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  min-width: 0;
  ${BrainBoxShadow}
`;

export const KpiTopo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textSecondary")};
  text-transform: uppercase;
  letter-spacing: 0.06em;
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

/* ─── Aviso de atenção ───────────────────────────────────────────────────── */

export const Aviso = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-radius: ${cssVarRadius("lg")};
  background: ${cssVarColor("warningSubtle")};
  border: 1px solid ${cssVarColor("warning")};
  color: ${cssVarColor("warningText")};

  > svg {
    font-size: 22px;
  }
`;

export const AvisoTexto = styled.div`
  flex: 1;
  min-width: 220px;

  strong {
    display: block;
    font-size: ${cssVarFontSize("body2")};
    font-weight: ${cssVarFontWeight("semibold")};
  }

  span {
    font-size: ${cssVarFontSize("small")};
  }
`;

/* ─── Barra de visão ─────────────────────────────────────────────────────── */

export const BarraVisao = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
`;

/* ─── Tabelas ────────────────────────────────────────────────────────────── */

export const TabelaWrap = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  overflow: hidden;
  ${BrainBoxShadow}
`;

export const Rolagem = styled.div`
  overflow-x: auto;
`;

export const Tabela = styled.table`
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  font-size: ${cssVarFontSize("body2")};

  th {
    text-align: left;
    padding: 11px 16px;
    font-size: ${cssVarFontSize("small")};
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("textSecondary")};
    text-transform: uppercase;
    letter-spacing: 0.06em;
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

  tbody tr {
    cursor: pointer;
    transition: background 0.15s ease;
  }

  tbody tr:hover {
    background: ${cssVarColor("backgroundHover")};
  }
`;

export const ThOrdenavel = styled.th<{ $direita?: boolean }>`
  cursor: pointer;
  user-select: none;
  ${({ $direita }) => $direita && "text-align: right !important;"}

  svg {
    font-size: 15px;
    vertical-align: -3px;
    opacity: 0.6;
    margin-left: 2px;
  }
`;

export const Num = styled.td<{ $tom?: Tom; $direita?: boolean; $forte?: boolean }>`
  font-variant-numeric: tabular-nums;
  ${({ $direita }) => $direita && "text-align: right;"}
  ${({ $forte }) => $forte && `font-weight: ${cssVarFontWeight("semibold")};`}
  ${({ $tom }) => $tom && $tom !== "neutral" && `color: ${tomFg[$tom]} !important;`}
  ${({ $tom }) => $tom === "neutral" && `color: ${cssVarColor("textTertiary")} !important;`}
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

export const AlunoCelula = styled.div`
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
    font-size: 11px;
    color: ${cssVarColor("textTertiary")};
    margin-top: 2px;
    font-variant-numeric: tabular-nums;
  }
`;

export const Iniciais = styled.span<{ $grande?: boolean }>`
  width: ${({ $grande }) => ($grande ? 48 : 32)}px;
  height: ${({ $grande }) => ($grande ? 48 : 32)}px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $grande }) => ($grande ? 15 : 11)}px;
  font-weight: ${cssVarFontWeight("semibold")};
  flex-shrink: 0;
`;

/** Nota com fundo suave: verde quando passa, vermelho quando não, neutro sem nota. */
export const NotaPill = styled.span<{ $tom: Tom }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 24px;
  padding: 0 8px;
  border-radius: ${cssVarRadius("pill")};
  font-weight: ${cssVarFontWeight("semibold")};
  font-variant-numeric: tabular-nums;
  background: ${({ $tom }) => tomBg[$tom]};
  color: ${({ $tom }) => tomFg[$tom]};
`;

export const Selo = styled.span<{ $tom: Tom }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

export const BarraProgresso = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
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
  background: ${({ $tom }) =>
    $tom === "error"
      ? cssVarColor("error")
      : $tom === "warning"
        ? cssVarColor("warning")
        : cssVarColor("success")};
`;

/* ─── Anotações ──────────────────────────────────────────────────────────── */

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

export const AnotacaoLinha = styled.div`
  display: grid;
  grid-template-columns: 64px 180px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 14px 18px;
  border-bottom: 1px solid ${cssVarColor("borderSubtle")};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
`;

export const AnotacaoData = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  padding-top: 3px;
  font-variant-numeric: tabular-nums;
`;

export const AnotacaoCorpo = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const AnotacaoAutor = styled.div`
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;

  span {
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
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

export const AnotacaoTexto = styled.div`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  line-height: 1.5;
`;

/* ─── Drawer do aluno ────────────────────────────────────────────────────── */

export const DrawerCorpo = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const DrawerTopo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 22px;
  border-bottom: 1px solid ${cssVarColor("borderSubtle")};

  strong {
    display: block;
    font-size: ${cssVarFontSize("h4")};
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("text")};
  }

  small {
    display: block;
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
    margin-top: 3px;
  }
`;

export const DrawerConteudo = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const DrawerRodape = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 14px 22px;
  border-top: 1px solid ${cssVarColor("borderSubtle")};
`;

export const MiniStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
`;

export const MiniStat = styled.div<{ $tom?: Tom }>`
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
  padding: 10px 12px;
  background: ${cssVarColor("surfaceSunken")};

  span {
    display: block;
    font-size: 10px;
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("textTertiary")};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: ${cssVarFontSize("h4")};
    font-weight: ${cssVarFontWeight("semibold")};
    font-variant-numeric: tabular-nums;
    color: ${({ $tom }) => ($tom && $tom !== "neutral" ? tomFg[$tom] : cssVarColor("text"))};
  }
`;

export const Bloco = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BlocoTitulo = styled.div`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};

  span {
    font-weight: ${cssVarFontWeight("regular")};
    color: ${cssVarColor("textTertiary")};
  }
`;

export const ListaDisciplinas = styled.div`
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
  overflow: hidden;
`;

export const LinhaDisciplina = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px 72px;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid ${cssVarColor("borderSubtle")};
  font-size: ${cssVarFontSize("body2")};

  &:last-child {
    border-bottom: none;
  }

  small {
    font-size: 12px;
    color: ${cssVarColor("textSecondary")};
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;

export const Datas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 10px;
    border: 1px solid ${cssVarColor("borderSubtle")};
    border-radius: ${cssVarRadius("pill")};
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("text")};
    font-variant-numeric: tabular-nums;
  }
`;

export const CartaoAnotacao = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};

  > div {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
  }
`;

export const TextoSuave = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;
