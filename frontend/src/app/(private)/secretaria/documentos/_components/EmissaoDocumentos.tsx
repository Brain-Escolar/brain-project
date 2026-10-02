"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  GlobalStyles,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BrainyMascot from "@/components/brainyMascot/BrainyMascot";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import { iniciais } from "@/components/documentacao/formatadores";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useBoletim, useHistorico } from "@/hooks/useDocumentosEscolares";
import { alunoApi } from "@/services/api";
import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { TipoDocumentoEscolar } from "@/services/domains/documento-escolar";
import FolhaBoletim, { boletimEhFinal } from "./FolhaBoletim";
import FolhaHistorico from "./FolhaHistorico";
import { ALTURA_FOLHA, LARGURA_FOLHA } from "./FolhaDocumento";

interface AlunoEscolhido {
  id: number;
  nome: string;
  matricula?: string | null;
  serieTurma?: string | null;
  desmatriculado?: boolean;
}

interface EmissaoDocumentosProps {
  alunoIdInicial: number | null;
  tipoInicial: TipoDocumentoEscolar;
}

const ID_RAIZ_IMPRESSAO = "doc-print-root";
const PADDING_PREVIA = 20;

function serieTurma(serie?: string | null, turma?: string | null): string | null {
  return [serie, turma].filter(Boolean).join(" · ") || null;
}

/**
 * Imprime só a folha: clona-a para uma raiz própria e esconde o resto da
 * página via CSS de impressão. O usuário escolhe "Salvar como PDF" no diálogo.
 */
function imprimirFolha(folha: HTMLElement, titulo: string) {
  const raiz = document.createElement("div");
  raiz.id = ID_RAIZ_IMPRESSAO;
  raiz.appendChild(folha.cloneNode(true));
  document.body.appendChild(raiz);
  document.documentElement.classList.add("doc-printing");
  const tituloOriginal = document.title;
  document.title = titulo;
  const limpar = () => {
    raiz.remove();
    document.documentElement.classList.remove("doc-printing");
    document.title = tituloOriginal;
    window.removeEventListener("afterprint", limpar);
  };
  window.addEventListener("afterprint", limpar);
  setTimeout(() => window.print(), 60);
}

export default function EmissaoDocumentos({ alunoIdInicial, tipoInicial }: EmissaoDocumentosProps) {
  const [tipo, setTipo] = useState<TipoDocumentoEscolar>(tipoInicial);
  const [aluno, setAluno] = useState<AlunoEscolhido | null>(
    alunoIdInicial != null ? { id: alunoIdInicial, nome: "" } : null,
  );
  const [busca, setBusca] = useState("");
  const [anoLetivo, setAnoLetivo] = useState<number | undefined>();
  const [periodoAte, setPeriodoAte] = useState<number | undefined>();
  const [incFrequencia, setIncFrequencia] = useState(true);
  const [incAssinaturas, setIncAssinaturas] = useState(true);
  const [incAnoEmCurso, setIncAnoEmCurso] = useState(true);
  const [incCargaHoraria, setIncCargaHoraria] = useState(true);
  const [observacao, setObservacao] = useState("");

  // Atalho vindo da URL (ficha do aluno) troca aluno e documento.
  useEffect(() => {
    if (alunoIdInicial != null) {
      setAluno({ id: alunoIdInicial, nome: "" });
      setAnoLetivo(undefined);
      setPeriodoAte(undefined);
    }
  }, [alunoIdInicial]);
  useEffect(() => setTipo(tipoInicial), [tipoInicial]);

  const buscaDebounced = useDebouncedValue(busca.trim(), 300);
  const { data: resultados = [], isFetching: buscando } = useQuery({
    queryKey: [...QUERY_KEYS.documentosEscolares.all, "busca-aluno", buscaDebounced],
    queryFn: async (): Promise<AlunoListaResponse[]> => {
      const params = { busca: buscaDebounced, page: 0, size: 6 };
      const [ativos, desmatriculados] = await Promise.all([
        alunoApi.getListaAlunos(params),
        alunoApi.getDesmatriculados(params),
      ]);
      return [...ativos.content, ...desmatriculados.content].slice(0, 8);
    },
    enabled: buscaDebounced.length >= 2,
    staleTime: 60 * 1000,
  });

  const isBoletim = tipo === "boletim";
  const boletimQuery = useBoletim(aluno?.id ?? null, { anoLetivo, periodoAte }, isBoletim);
  const historicoQuery = useHistorico(aluno?.id ?? null, !isBoletim);
  const query = isBoletim ? boletimQuery : historicoQuery;
  const boletim = boletimQuery.data;
  const historico = historicoQuery.data;
  const alunoDados = (isBoletim ? boletim : historico)?.aluno;

  const boletimIndisponivel = isBoletim && !!boletim && !boletim.relatorio;
  const relatorio = boletim?.relatorio ?? null;
  const anoEmCurso = relatorio ? !boletimEhFinal(relatorio, boletim?.periodoAte ?? null) : false;

  // ----- prévia em escala -----
  const previaRef = useRef<HTMLDivElement>(null);
  const folhaRef = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.8);
  const [alturaFolha, setAlturaFolha] = useState(ALTURA_FOLHA);
  const temFolha = !!aluno && (isBoletim ? !!relatorio : !!historico);

  useLayoutEffect(() => {
    const previa = previaRef.current;
    if (!previa) return;
    const medir = () => {
      const largura = previa.clientWidth - PADDING_PREVIA * 2;
      setEscala(Math.max(0.3, Math.min(1, largura / LARGURA_FOLHA)));
      if (folhaRef.current) setAlturaFolha(folhaRef.current.offsetHeight);
    };
    const observer = new ResizeObserver(medir);
    observer.observe(previa);
    if (folhaRef.current) observer.observe(folhaRef.current);
    medir();
    return () => observer.disconnect();
  }, [temFolha, tipo]);

  function escolherAluno(a: AlunoListaResponse) {
    setAluno({
      id: a.id,
      nome: a.nomeSocial || a.nome,
      matricula: a.matricula,
      serieTurma: serieTurma(a.serie, a.turma),
      desmatriculado: !a.matriculado,
    });
    setBusca("");
    setAnoLetivo(undefined);
    setPeriodoAte(undefined);
  }

  function exportar() {
    if (!folhaRef.current || !alunoDados) return;
    const titulo = isBoletim
      ? `Boletim ${boletim?.anoLetivo ?? ""} - ${alunoDados.nome}`
      : `Histórico escolar - ${alunoDados.nome}`;
    imprimirFolha(folhaRef.current, titulo);
  }

  const nomeCard = alunoDados?.nome ?? aluno?.nome;
  const matriculaCard = alunoDados?.matricula ?? aluno?.matricula;
  const serieTurmaCard = alunoDados
    ? serieTurma(alunoDados.serie, alunoDados.turma)
    : aluno?.serieTurma;
  const desmatriculadoCard = alunoDados ? !alunoDados.matriculado : aluno?.desmatriculado;

  const periodos = relatorio?.periodos ?? [];
  const opcoesPeriodo = periodos.filter((p) => p.sequence <= (boletim?.ultimoPeriodoIniciado ?? 0));
  const periodoTravado = !relatorio || opcoesPeriodo.length <= 1;

  return (
    <>
      <GlobalStyles
        styles={{
          ["@media screen"]: { [`#${ID_RAIZ_IMPRESSAO}`]: { display: "none" } },
          ["@media print"]: {
            "@page": { size: "A4", margin: 0 },
            [`html.doc-printing body > *:not(#${ID_RAIZ_IMPRESSAO})`]: {
              display: "none !important",
            },
            "html.doc-printing, html.doc-printing body": {
              background: "#fff !important",
              height: "auto !important",
              minHeight: "0 !important",
            },
            [`#${ID_RAIZ_IMPRESSAO} > *`]: {
              boxShadow: "none !important",
              margin: "0 !important",
              width: "210mm !important",
              minHeight: "297mm !important",
            },
            [`#${ID_RAIZ_IMPRESSAO} *`]: {
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            },
            [`#${ID_RAIZ_IMPRESSAO} [data-row]`]: { breakInside: "avoid" },
          },
        }}
      />

      <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* CONFIGURAÇÃO */}
        <Paper
          sx={{
            flex: "1 1 300px",
            maxWidth: { md: 380 },
            position: { md: "sticky" },
            top: 16,
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2.25,
            boxShadow: 1,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Documento
            </Typography>
            <SegmentedControl
              ariaLabel="Tipo de documento"
              fullWidth
              value={tipo}
              onChange={setTipo}
              options={[
                { value: "boletim", label: "Boletim" },
                { value: "historico", label: "Histórico escolar" },
              ]}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Aluno
            </Typography>
            {aluno && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Avatar sx={{ width: 38, height: 38, fontSize: 12, fontWeight: 600 }}>
                  {nomeCard ? iniciais(nomeCard) : "…"}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {nomeCard || "Carregando…"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap component="div">
                    {[matriculaCard, serieTurmaCard].filter(Boolean).join(" · ") || "—"}
                  </Typography>
                </Box>
                {desmatriculadoCard && (
                  <Chip size="small" variant="outlined" label="Desmatriculado" />
                )}
              </Box>
            )}
            <TextField
              size="small"
              placeholder={
                aluno ? "Trocar aluno — nome ou matrícula" : "Buscar aluno — nome ou matrícula"
              }
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: buscando ? <CircularProgress size={16} /> : undefined,
                },
              }}
            />
            {buscaDebounced.length >= 2 && !buscando && (
              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                {resultados.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>
                    Nenhum aluno encontrado
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {resultados.map((r) => (
                      <ListItemButton key={r.id} divider onClick={() => escolherAluno(r)}>
                        <ListItemText
                          primary={r.nomeSocial || r.nome}
                          secondary={[
                            serieTurma(r.serie, r.turma),
                            r.matriculado ? null : "desmatriculado",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Box>

          {isBoletim ? (
            <>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <TextField
                  select
                  size="small"
                  label="Ano letivo"
                  value={boletim?.anoLetivo ?? ""}
                  disabled={!boletim || boletim.anosDisponiveis.length === 0}
                  onChange={(e) => {
                    setAnoLetivo(Number(e.target.value));
                    setPeriodoAte(undefined);
                  }}
                >
                  {boletim && !boletim.anosDisponiveis.includes(boletim.anoLetivo) && (
                    <MenuItem value={boletim.anoLetivo}>{boletim.anoLetivo}</MenuItem>
                  )}
                  {(boletim?.anosDisponiveis ?? []).map((ano) => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                      {ano === new Date().getFullYear() ? " (em curso)" : ""}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Período"
                  value={boletim?.periodoAte ?? ""}
                  disabled={periodoTravado}
                  onChange={(e) => setPeriodoAte(Number(e.target.value))}
                >
                  {opcoesPeriodo.map((p) => (
                    <MenuItem key={p.id} value={p.sequence}>
                      {p.sequence === periodos.length && !p.isCurrent
                        ? "Ano completo"
                        : `Até o ${p.name}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={incFrequencia}
                      onChange={(e) => setIncFrequencia(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">Faltas e frequência por disciplina</Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={incAssinaturas}
                      onChange={(e) => setIncAssinaturas(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">Campos de assinatura</Typography>}
                />
              </Box>
            </>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={incAnoEmCurso}
                    onChange={(e) => setIncAnoEmCurso(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">Incluir ano em curso (notas parciais)</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={incCargaHoraria}
                    onChange={(e) => setIncCargaHoraria(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">Carga horária por componente</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={incAssinaturas}
                    onChange={(e) => setIncAssinaturas(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">Campos de assinatura</Typography>}
              />
            </Box>
          )}

          <TextField
            label="Observações no documento"
            placeholder="Opcional — aparece no rodapé do documento"
            multiline
            minRows={3}
            size="small"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />

          {boletimIndisponivel && (
            <Alert severity="warning">
              <strong>Boletim indisponível.</strong> Aluno sem turma em {boletim?.anoLetivo} — não
              há notas lançadas. Conclua a enturmação para emitir.
            </Alert>
          )}
          {query.isError && (
            <Alert severity="error">Não foi possível carregar o documento. Tente novamente.</Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              borderTop: 1,
              borderColor: "divider",
              pt: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={<PictureAsPdfOutlinedIcon />}
              disabled={!temFolha || query.isFetching}
              onClick={exportar}
              fullWidth
            >
              Exportar PDF
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Na janela de impressão, escolha “Salvar como PDF”.
            </Typography>
          </Box>
        </Paper>

        {/* PRÉ-VISUALIZAÇÃO */}
        <Box
          ref={previaRef}
          sx={{
            flex: "999 1 520px",
            minWidth: 0,
            bgcolor: "action.hover",
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
            p: `${PADDING_PREVIA}px`,
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
            >
              <VisibilityOutlinedIcon fontSize="small" color="action" />
              Pré-visualização
              {anoEmCurso && isBoletim && <Chip size="small" label="Parcial" sx={{ ml: 0.5 }} />}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              A4 · retrato · {Math.round(escala * 100)}%
            </Typography>
          </Box>

          {!aluno ? (
            <EstadoVazio
              icone={isBoletim ? <DescriptionOutlinedIcon /> : <HistoryEduOutlinedIcon />}
              titulo="Escolha um aluno"
              texto="Busque pelo nome ou matrícula no painel ao lado para gerar a prévia do documento."
            />
          ) : query.isLoading ? (
            <Box sx={{ py: 8 }}>
              <CircularProgress />
            </Box>
          ) : boletimIndisponivel ? (
            <EstadoVazio
              titulo="Sem notas para este período"
              texto={`Este aluno não está enturmado em ${boletim?.anoLetivo}. Escolha outro ano letivo ou gere o histórico escolar.`}
            />
          ) : temFolha ? (
            <Box
              sx={{
                width: Math.round(LARGURA_FOLHA * escala),
                height: Math.round(alturaFolha * escala),
                flexShrink: 0,
                opacity: query.isFetching ? 0.6 : 1,
                transition: "opacity 120ms",
              }}
            >
              <Box
                sx={{
                  width: LARGURA_FOLHA,
                  transform: `scale(${escala})`,
                  transformOrigin: "top left",
                  boxShadow: 3,
                }}
              >
                {isBoletim && boletim?.relatorio ? (
                  <FolhaBoletim
                    ref={folhaRef}
                    boletim={{ ...boletim, relatorio: boletim.relatorio }}
                    opcoes={{ frequencia: incFrequencia, assinaturas: incAssinaturas, observacao }}
                  />
                ) : historico ? (
                  <FolhaHistorico
                    ref={folhaRef}
                    historico={historico}
                    opcoes={{
                      anoEmCurso: incAnoEmCurso,
                      cargaHoraria: incCargaHoraria,
                      assinaturas: incAssinaturas,
                      observacao,
                    }}
                  />
                ) : null}
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </>
  );
}

function EstadoVazio({
  icone,
  titulo,
  texto,
}: {
  icone?: ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <Box
      sx={{
        py: 7,
        px: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.25,
        textAlign: "center",
      }}
    >
      {icone ? (
        <Box sx={{ color: "text.secondary", "& svg": { fontSize: 40 } }}>{icone}</Box>
      ) : (
        <BrainyMascot height={88} />
      )}
      <Typography variant="h6" fontWeight={600}>
        {titulo}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, lineHeight: 1.5 }}>
        {texto}
      </Typography>
    </Box>
  );
}
