"use client";

import { ReactElement, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  InputAdornment,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";
import { useCatalogoPermissoes } from "@/hooks/useGruposUsuarios";
import {
  AcessosGrupoUsuarioRequest,
  ControleCatalogoResponse,
  TelaCatalogoResponse,
} from "@/services/domains/grupo-usuario";
import {
  IndiceCatalogo,
  aplicarEmLote,
  desmarcar,
  marcar,
  mesmoConjunto,
  montarIndice,
} from "../acessos";
import { iconeDaTela } from "../iconeDaTela";
import { nomeDoPerfil } from "../perfisDeGrupo";

type Filtro = "TODAS" | "LIBERADAS" | "NAO_LIBERADAS";

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "LIBERADAS", label: "Liberadas" },
  { value: "NAO_LIBERADAS", label: "Não liberadas" },
];

const SEM_HERDADOS: Record<string, string[]> = {};

interface EditorAcessosProps {
  perfil: PerfilNomeEnum;
  /** Códigos salvos: os do grupo, ou os individuais da pessoa. */
  salvos: string[];
  /**
   * Só na página de acessos individuais: código → grupos que já o dão à
   * pessoa. Esses itens aparecem marcados e travados, e não contam como
   * individuais.
   */
  herdados?: Record<string, string[]>;
  salvando: boolean;
  onSalvar: (dados: AcessosGrupoUsuarioRequest) => void;
}

/**
 * Lista de telas e ações do teto do perfil, com caixas de seleção. É a aba
 * Acessos do grupo e a página de acessos individuais de uma pessoa.
 */
export default function EditorAcessos({
  perfil,
  salvos: codigosSalvos,
  herdados,
  salvando,
  onSalvar,
}: EditorAcessosProps) {
  const individual = herdados !== undefined;
  const { catalogo, loading, error } = useCatalogoPermissoes(perfil, individual);
  const indice = useMemo(() => montarIndice(catalogo), [catalogo]);
  const deGrupos = herdados ?? SEM_HERDADOS;

  // O que está salvo, limitado ao catálogo: item que saiu do teto não aparece e,
  // ao salvar, deixa de existir também. A chave em texto evita recalcular (e
  // descartar as marcações) quando quem chama monta um array novo a cada render.
  const chaveSalvos = codigosSalvos.join("|");
  const salvos = useMemo(
    () => new Set(chaveSalvos.split("|").filter((codigo) => indice.itens.has(codigo))),
    [chaveSalvos, indice],
  );
  const [marcados, setMarcados] = useState<Set<string>>(salvos);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODAS");
  const [abertas, setAbertas] = useState<Set<string>>(new Set());

  // Volta ao estado salvo quando os dados são recarregados (depois de salvar, por exemplo).
  useEffect(() => {
    setMarcados(new Set(salvos));
  }, [salvos]);

  const telasEmOrdem = useMemo(
    () => [...(catalogo?.telas ?? [])].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [catalogo],
  );

  if (loading) return <Skeleton variant="rounded" height={320} />;
  if (error || !catalogo)
    return <Alert severity="error">{error ?? "Catálogo indisponível."}</Alert>;

  if (catalogo.telas.length === 0 && catalogo.controlesGerais.length === 0) {
    return (
      <Alert severity="info">
        O perfil {nomeDoPerfil(perfil)} ainda não tem telas disponíveis. Quando o sistema ganhar
        telas para ele, elas aparecem aqui.
      </Alert>
    );
  }

  const herdado = (codigo: string) => !!deGrupos[codigo];
  const ligado = (codigo: string) => marcados.has(codigo) || herdado(codigo);
  // Os itens próprios, sem o que já vem dos grupos (na aba do grupo, são todos).
  const proprios = (codigos: Set<string>) => new Set([...codigos].filter((c) => !herdado(c)));

  const termo = normalizar(busca.trim());
  const casa = (texto: string) => normalizar(texto).includes(termo);
  const passaNoFiltro = (codigo: string) =>
    filtro === "TODAS" || (filtro === "LIBERADAS") === ligado(codigo);

  const telasVisiveis = telasEmOrdem.filter(
    (tela) =>
      passaNoFiltro(tela.codigo) &&
      (!termo ||
        casa(tela.nome) ||
        casa(tela.rota) ||
        tela.controles.some((controle) => casa(controle.nome))),
  );
  const controlesGeraisVisiveis = catalogo.controlesGerais.filter(
    (controle) => passaNoFiltro(controle.codigo) && (!termo || casa(controle.nome)),
  );
  // A busca achou uma ação, e não a tela: abre a linha para mostrá-la.
  const abertaPelaBusca = (tela: TelaCatalogoResponse) =>
    !!termo &&
    !casa(tela.nome) &&
    !casa(tela.rota) &&
    tela.controles.some((controle) => casa(controle.nome));

  const alterado = !mesmoConjunto(proprios(marcados), proprios(salvos));
  const filtrando = !!termo || filtro !== "TODAS";
  const totalAcoes =
    catalogo.telas.reduce((soma, tela) => soma + tela.controles.length, 0) +
    catalogo.controlesGerais.length;
  const contar = (tipo: "tela" | "controle") =>
    [...proprios(marcados)].filter((codigo) => indice.itens.get(codigo)?.tipo === tipo).length;

  function avisarArrastados(arrastados: string[], acao: "liberamos" | "retiramos") {
    // O que já vem de um grupo não mudou para a pessoa: não entra no aviso.
    const nomes = [...new Set(arrastados)]
      .filter((codigo) => !herdado(codigo))
      .map((codigo) => indice.itens.get(codigo)?.nome ?? codigo);
    setAviso(nomes.length > 0 ? `Também ${acao}: ${nomes.join(", ")}.` : null);
  }

  function alternar(codigo: string) {
    const ligar = !marcados.has(codigo);
    const resultado = ligar
      ? marcar(indice, marcados, codigo)
      : desmarcar(indice, marcados, codigo);
    setMarcados(resultado.marcados);
    avisarArrastados(resultado.arrastados, ligar ? "liberamos" : "retiramos");

    // Ao liberar uma tela com ações, abre a linha: as ações não vêm marcadas
    // sozinhas, e escondidas a pessoa nem saberia que existem.
    const tela = catalogo?.telas.find((t) => t.codigo === codigo);
    if (ligar && tela && tela.controles.length > 0) {
      setAbertas((atuais) => new Set(atuais).add(codigo));
    }
  }

  function alternarVisiveis(ligar: boolean) {
    const codigos = telasVisiveis.map((tela) => tela.codigo);
    const resultado = aplicarEmLote(indice, marcados, codigos, ligar ? marcar : desmarcar);
    setMarcados(resultado.marcados);
    // As telas do lote e as ações delas são o esperado; o aviso é para o resto.
    const doLote = new Set(
      telasVisiveis.flatMap((tela) => [tela.codigo, ...tela.controles.map((c) => c.codigo)]),
    );
    avisarArrastados(
      resultado.arrastados.filter((codigo) => !doLote.has(codigo)),
      ligar ? "liberamos" : "retiramos",
    );
  }

  function abrirOuFechar(codigo: string) {
    setAbertas((atuais) => {
      const proximas = new Set(atuais);
      if (proximas.has(codigo)) proximas.delete(codigo);
      else proximas.add(codigo);
      return proximas;
    });
  }

  function salvar() {
    // O conjunto salvo precisa funcionar sozinho (o backend valida assim): as
    // dependências entram mesmo que um grupo já as dê, e o que só estava ali
    // por já vir de um grupo sai.
    const codigos = [...aplicarEmLote(indice, new Set(), [...proprios(marcados)], marcar).marcados];
    onSalvar({
      telas: codigos.filter((codigo) => indice.itens.get(codigo)?.tipo === "tela"),
      controles: codigos.filter((codigo) => indice.itens.get(codigo)?.tipo === "controle"),
    });
    setAviso(null);
  }

  function descartar() {
    setMarcados(new Set(salvos));
    setAviso(null);
  }

  const quantas = !filtrando
    ? "todas"
    : telasVisiveis.length === 1
      ? "a exibida"
      : `as ${telasVisiveis.length} exibidas`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1.5,
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar tela ou ação"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            sx={{ minWidth: { sm: 280 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { "aria-label": "Buscar tela ou ação" },
            }}
          />
          <SegmentedControl
            value={filtro}
            options={FILTROS}
            onChange={setFiltro}
            ariaLabel="Mostrar telas"
          />
        </Box>
        {/* Acesso individual é exceção de poucos itens: liberar tudo de uma vez
            seria montar um grupo escondido. */}
        {!individual && (
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button
              size="small"
              onClick={() => alternarVisiveis(true)}
              disabled={telasVisiveis.length === 0}
            >
              Liberar {quantas}
            </Button>
            <Button
              size="small"
              onClick={() => alternarVisiveis(false)}
              disabled={telasVisiveis.length === 0}
            >
              Retirar {quantas}
            </Button>
          </Box>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary">
        {individual
          ? `Individuais: ${quantidade(contar("tela"), "tela", "telas")} e ${quantidade(contar("controle"), "ação", "ações")}. O que está marcado e travado já vem dos grupos.`
          : `${contar("tela")} de ${catalogo.telas.length} telas liberadas · ${contar("controle")} de ${totalAcoes} ações`}
      </Typography>

      {telasVisiveis.length > 0 ? (
        <Paper variant="outlined">
          {telasVisiveis.map((tela, posicao) => (
            <LinhaTela
              key={tela.codigo}
              tela={tela}
              icone={iconeDaTela(tela.codigo, perfil)}
              primeira={posicao === 0}
              aberta={abertas.has(tela.codigo) || abertaPelaBusca(tela)}
              indice={indice}
              marcados={marcados}
              herdados={deGrupos}
              onAlternar={alternar}
              onAbrirOuFechar={abrirOuFechar}
            />
          ))}
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {termo
              ? `Nenhuma tela encontrada para "${busca.trim()}".`
              : filtro === "LIBERADAS"
                ? individual
                  ? "Nenhuma tela liberada para esta pessoa."
                  : "Nenhuma tela liberada neste grupo."
                : "Todas as telas já estão liberadas."}
          </Typography>
        </Paper>
      )}

      {controlesGeraisVisiveis.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" component="h3" fontWeight={600}>
            Valem em qualquer tela
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Dados e ações que aparecem em mais de uma tela.
          </Typography>
          {controlesGeraisVisiveis.map((controle) => (
            <LinhaControle
              key={controle.codigo}
              controle={controle}
              indice={indice}
              marcado={marcados.has(controle.codigo)}
              herdadoDe={deGrupos[controle.codigo]}
              habilitado
              onAlternar={alternar}
            />
          ))}
        </Paper>
      )}

      {/* Fixa no rodapé enquanto houver alteração: a lista é longa, e o aviso do que
          mudou junto precisa aparecer perto de quem clicou, não lá no topo. */}
      {alterado && (
        <Paper
          elevation={4}
          role="region"
          aria-label="Alterações não salvas"
          sx={{
            position: "sticky",
            bottom: 16,
            zIndex: 2,
            p: 1.5,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              Alterações não salvas
            </Typography>
            {aviso && (
              <Typography variant="caption" color="text.secondary" component="p" role="status">
                {aviso}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", flexShrink: 0 }}>
            <Button onClick={descartar} disabled={salvando}>
              Descartar
            </Button>
            <Button variant="contained" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar acessos"}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

// ------------------------------------------------------------------ linhas

interface LinhaTelaProps {
  tela: TelaCatalogoResponse;
  icone: ReactElement;
  primeira: boolean;
  aberta: boolean;
  indice: IndiceCatalogo;
  marcados: Set<string>;
  herdados: Record<string, string[]>;
  onAlternar: (codigo: string) => void;
  onAbrirOuFechar: (codigo: string) => void;
}

function LinhaTela({
  tela,
  icone,
  primeira,
  aberta,
  indice,
  marcados,
  herdados,
  onAlternar,
  onAbrirOuFechar,
}: LinhaTelaProps) {
  const herdadaDe = herdados[tela.codigo];
  const liberada = marcados.has(tela.codigo) || !!herdadaDe;
  const total = tela.controles.length;
  const acoesMarcadas = tela.controles.filter(
    (controle) => marcados.has(controle.codigo) || !!herdados[controle.codigo],
  ).length;
  const idAcoes = `acoes-${tela.codigo}`;

  return (
    <Box>
      {!primeira && <Divider />}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: { xs: 1, sm: 2 }, py: 1 }}>
        <ComMotivo motivo={herdadaDe && motivoDoBloqueio("tela", herdadaDe)}>
          <Checkbox
            checked={liberada}
            disabled={!!herdadaDe}
            onChange={() => onAlternar(tela.codigo)}
            slotProps={{ input: { "aria-label": `Liberar ${tela.nome}` } }}
          />
        </ComMotivo>
        <Box
          aria-hidden
          sx={{
            display: "flex",
            color: liberada ? "primary.main" : "text.disabled",
            transition: "color 150ms",
          }}
        >
          {icone}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, ml: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            <Typography variant="body2" fontWeight={600}>
              {tela.nome}
            </Typography>
            <Etiquetas doPerfil={tela.doPerfil} />
          </Box>
          <Typography variant="caption" color="text.secondary" component="p">
            {legenda(tela.rota, herdadaDe && deOndeVem(herdadaDe), precisaDe(indice, tela.codigo))}
          </Typography>
        </Box>
        {total > 0 && (
          <Button
            size="small"
            color="inherit"
            onClick={() => onAbrirOuFechar(tela.codigo)}
            aria-expanded={aberta}
            aria-controls={idAcoes}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: aberta ? "rotate(180deg)" : "none",
                  transition: "transform 150ms",
                }}
              />
            }
            sx={{ flexShrink: 0, color: "text.secondary", whiteSpace: "nowrap" }}
          >
            {acoesMarcadas} de {total} {total === 1 ? "ação" : "ações"}
          </Button>
        )}
      </Box>
      {total > 0 && (
        <Collapse in={aberta} unmountOnExit>
          <Box id={idAcoes} sx={{ pl: { xs: 2, sm: 11 }, pr: 2, pb: 1.5 }}>
            <Typography variant="overline" color="text.secondary" component="p">
              O que pode fazer aqui
            </Typography>
            {tela.controles.map((controle) => (
              <LinhaControle
                key={controle.codigo}
                controle={controle}
                indice={indice}
                marcado={marcados.has(controle.codigo)}
                herdadoDe={herdados[controle.codigo]}
                habilitado={liberada}
                onAlternar={onAlternar}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

interface LinhaControleProps {
  controle: ControleCatalogoResponse;
  indice: IndiceCatalogo;
  marcado: boolean;
  /** Grupos que já dão este controle à pessoa (página de acessos individuais). */
  herdadoDe?: string[];
  habilitado: boolean;
  onAlternar: (codigo: string) => void;
}

function LinhaControle({
  controle,
  indice,
  marcado,
  herdadoDe,
  habilitado,
  onAlternar,
}: LinhaControleProps) {
  const detalhe = legenda(
    controle.descricao,
    herdadoDe && deOndeVem(herdadoDe),
    precisaDe(indice, controle.codigo),
  );
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 0.25 }}>
      <ComMotivo motivo={herdadoDe && motivoDoBloqueio("ação", herdadoDe)}>
        <Checkbox
          size="small"
          checked={marcado || !!herdadoDe}
          disabled={!habilitado || !!herdadoDe}
          onChange={() => onAlternar(controle.codigo)}
          slotProps={{ input: { "aria-label": `Ação ${controle.nome}` } }}
          sx={{ mt: -0.5 }}
        />
      </ComMotivo>
      <Box sx={{ minWidth: 0, opacity: habilitado ? 1 : 0.6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <Typography variant="body2">{controle.nome}</Typography>
          <Etiquetas doPerfil={controle.doPerfil} sensivel={controle.sensivel} />
        </Box>
        {detalhe && (
          <Typography variant="caption" color="text.secondary" component="p">
            {detalhe}
          </Typography>
        )}
        {!habilitado && (
          <Typography variant="caption" color="text.secondary" component="p">
            Libere a tela para escolher.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/** "Para funcionar, precisa de: Ver ficha médica" — a dependência antes do clique. */
function precisaDe(indice: IndiceCatalogo, codigo: string): string {
  const exigidos = indice.exige.get(codigo);
  if (!exigidos || exigidos.length === 0) return "";
  const nomes = exigidos.map((exigido) => indice.itens.get(exigido)?.nome ?? exigido);
  return `Para funcionar, precisa de: ${nomes.join(", ")}`;
}

/**
 * "De outro perfil" (só no acesso individual, D22) e "Dado sensível" (D23):
 * avisos de quem libera, antes de liberar.
 */
function Etiquetas({ doPerfil, sensivel = false }: { doPerfil: boolean; sensivel?: boolean }) {
  return (
    <>
      {!doPerfil && <Chip size="small" variant="outlined" label="De outro perfil" />}
      {sensivel && <Chip size="small" color="warning" variant="outlined" label="Dado sensível" />}
    </>
  );
}

/**
 * Caixa travada porque o item já vem de um grupo: o tooltip explica o motivo.
 * O span recebe o mouse, que a caixa desabilitada não recebe.
 */
function ComMotivo({ motivo, children }: { motivo?: string | false; children: ReactElement }) {
  if (!motivo) return children;
  return (
    <Tooltip title={motivo} describeChild>
      <span style={{ display: "inline-flex" }}>{children}</span>
    </Tooltip>
  );
}

function motivoDoBloqueio(tipo: "tela" | "ação", grupos: string[]): string {
  const onde = grupos.length === 1 ? `no grupo ${grupos[0]}` : `nos grupos ${juntar(grupos)}`;
  return `Bloqueada: esta ${tipo} já está liberada ${onde}. Para mudar, edite o grupo.`;
}

/** "Vem do grupo Secretaria (padrão)": por que o item está marcado e travado. */
function deOndeVem(grupos: string[]): string {
  return grupos.length === 1 ? `Vem do grupo ${grupos[0]}` : `Vem dos grupos ${juntar(grupos)}`;
}

function juntar(nomes: string[]): string {
  return nomes.length === 1
    ? nomes[0]
    : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

function quantidade(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

function legenda(...partes: (string | false | null | undefined)[]): string {
  return partes.filter(Boolean).join(" · ");
}

/** Busca sem diferenciar maiúsculas nem acentos ("calendario" acha "Calendário"). */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
