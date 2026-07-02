"use client";

import { tarefaApi } from "@/services/api";
import { professorApi } from "@/services/api";
import { ProfessorAulaSemanalResponse } from "@/services/domains/professor";
import { TarefaLotePostRequest } from "@/services/domains/tarefa/request";
import { QUERY_KEYS } from "@/constants/queryKeys";
import FileUploadArea from "@/components/fileUploadArea";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

interface ModalCriarTarefaProps {
  open: boolean;
  onClose: () => void;
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function gerarSemanas(quantidade = 8): Array<{ label: string; value: string }> {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const offsetSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segundaAtual = new Date(hoje);
  segundaAtual.setDate(hoje.getDate() + offsetSegunda);

  return Array.from({ length: quantidade }, (_, i) => {
    const segunda = new Date(segundaAtual);
    segunda.setDate(segundaAtual.getDate() + i * 7);
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 6);

    const isoSegunda = segunda.toISOString().split("T")[0];
    const labelInicio = `${String(segunda.getDate()).padStart(2, "0")} ${MESES[segunda.getMonth()]}`;
    const labelFim = `${String(domingo.getDate()).padStart(2, "0")} ${MESES[domingo.getMonth()]}`;

    return { label: `${labelInicio} - ${labelFim}`, value: isoSegunda };
  });
}

const SEMANAS = gerarSemanas();

export default function ModalCriarTarefa({ open, onClose }: ModalCriarTarefaProps) {
  const queryClient = useQueryClient();

  const [semanaInicio, setSemanaInicio] = useState("");
  const [serieId, setSerieId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [numeroAula, setNumeroAula] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tarefa, setTarefa] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);

  const { data: aulasSemanais = [] } = useQuery({
    queryKey: [...QUERY_KEYS.aulas.all, "semana"],
    queryFn: () => professorApi.getAulasSemanalProfessor(),
    staleTime: 10 * 60 * 1000,
    enabled: open,
  });

  const series = useMemo<Array<{ id: number; nome: string }>>(() => {
    const map = new Map<number, string>();
    aulasSemanais.forEach((a: ProfessorAulaSemanalResponse) => map.set(a.serieId, a.serie));
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [aulasSemanais]);

  const disciplinas = useMemo<Array<{ id: number; nome: string }>>(() => {
    if (!serieId) return [];
    const map = new Map<number, string>();
    aulasSemanais
      .filter((a: ProfessorAulaSemanalResponse) => a.serieId === Number(serieId))
      .forEach((a: ProfessorAulaSemanalResponse) => map.set(a.disciplinaId, a.disciplina));
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [aulasSemanais, serieId]);

  const maxAulas = useMemo<number>(() => {
    if (!serieId || !disciplinaId) return 0;
    const aulasFiltradas = aulasSemanais.filter(
      (a: ProfessorAulaSemanalResponse) =>
        a.serieId === Number(serieId) && a.disciplinaId === Number(disciplinaId),
    );
    const contagemPorTurma = new Map<number, number>();
    aulasFiltradas.forEach((a: ProfessorAulaSemanalResponse) => {
      contagemPorTurma.set(a.turmaId, (contagemPorTurma.get(a.turmaId) ?? 0) + 1);
    });
    return Math.max(0, ...Array.from(contagemPorTurma.values()));
  }, [aulasSemanais, serieId, disciplinaId]);

  function handleClose() {
    setSemanaInicio("");
    setSerieId("");
    setDisciplinaId("");
    setNumeroAula("");
    setConteudo("");
    setTarefa("");
    setSelectedFile(null);
    onClose();
  }

  function handleSerieChange(value: string) {
    setSerieId(value);
    setDisciplinaId("");
    setNumeroAula("");
  }

  function handleDisciplinaChange(value: string) {
    setDisciplinaId(value);
    setNumeroAula("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!semanaInicio || !serieId || !disciplinaId || !numeroAula || !conteudo || !tarefa) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    try {
      const dados: TarefaLotePostRequest = {
        semanaInicio,
        numeroAula: Number(numeroAula),
        serieId: Number(serieId),
        disciplinaId: Number(disciplinaId),
        conteudo,
        tarefa,
      };
      await tarefaApi.criarTarefaLote(dados, selectedFile ?? undefined);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tarefas.all });
      toast.success("Tarefas criadas com sucesso!");
      handleClose();
    } catch {
      toast.error("Erro ao criar as tarefas. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600 }}>Nova Tarefa em Lote</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Semana</InputLabel>
            <Select
              value={semanaInicio}
              label="Semana"
              onChange={(e) => setSemanaInicio(e.target.value)}
            >
              {SEMANAS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Série</InputLabel>
            <Select
              value={serieId}
              label="Série"
              onChange={(e) => handleSerieChange(e.target.value)}
              disabled={series.length === 0}
            >
              {series.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  {s.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Disciplina</InputLabel>
            <Select
              value={disciplinaId}
              label="Disciplina"
              onChange={(e) => handleDisciplinaChange(e.target.value)}
              disabled={!serieId}
            >
              {disciplinas.map((d) => (
                <MenuItem key={d.id} value={String(d.id)}>
                  {d.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Aula da semana</InputLabel>
            <Select
              value={numeroAula}
              label="Aula da semana"
              onChange={(e) => setNumeroAula(e.target.value)}
              disabled={!disciplinaId || maxAulas === 0}
            >
              {Array.from({ length: maxAulas }, (_, i) => (
                <MenuItem key={i + 1} value={String(i + 1)}>
                  {i + 1}ª aula
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Conteúdo da aula"
            placeholder="O que foi ensinado nesta aula"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            multiline
            rows={2}
            required
            fullWidth
          />

          <TextField
            label="Dever de casa"
            placeholder="Tarefa para os alunos realizarem"
            value={tarefa}
            onChange={(e) => setTarefa(e.target.value)}
            multiline
            rows={2}
            required
            fullWidth
          />

          <div>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Arquivo (opcional)
            </Typography>
            <FileUploadArea
              files={selectedFile ? [selectedFile] : []}
              onChange={(files) => setSelectedFile(files[files.length - 1] ?? null)}
              multiple={false}
              label="Clique para selecionar um arquivo (PDF, Word, Excel, PowerPoint ou imagem)"
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={salvando}
            startIcon={salvando ? <CircularProgress size={16} /> : undefined}
          >
            {salvando ? "Criando..." : "Criar tarefas"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
