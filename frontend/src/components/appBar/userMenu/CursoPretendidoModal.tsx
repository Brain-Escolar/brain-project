"use client";

import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alunoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

interface CursoPretendidoModalProps {
  open: boolean;
  cursoPretendidoAtual?: string;
  onClose: () => void;
}

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function CursoPretendidoModal({
  open,
  cursoPretendidoAtual,
  onClose,
}: CursoPretendidoModalProps) {
  const queryClient = useQueryClient();
  const [busca, setBusca] = React.useState("");
  const [selecionado, setSelecionado] = React.useState<string>("");

  const { data: cursos = [], isLoading: loadingCursos } = useQuery({
    queryKey: QUERY_KEYS.alunos.cursosPretendidos(),
    queryFn: () => alunoApi.getCursosPretendidos(),
    staleTime: Infinity,
  });

  const { mutate: salvar, isPending } = useMutation({
    mutationFn: (cursoPretendido: string) => alunoApi.atualizarCursoPretendido(cursoPretendido),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.perfil() });
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      setBusca("");
      const cursoAtual = cursos.find((c) => c.descricao === cursoPretendidoAtual);
      setSelecionado(cursoAtual?.nome ?? "");
    }
  }, [open, cursoPretendidoAtual, cursos]);

  const cursosFiltrados = cursos.filter((c) =>
    normalizar(c.descricao).includes(normalizar(busca)),
  );

  const handleSalvar = () => {
    if (selecionado) salvar(selecionado);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        Escolher Curso Pretendido
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Selecione o curso de faculdade que você pretende fazer
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar curso..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && busca) {
              e.stopPropagation();
              setBusca("");
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
          autoFocus
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          Dica: Pressione <kbd>ESC</kbd> para limpar a busca
        </Typography>

        {loadingCursos ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
            <RadioGroup value={selecionado} onChange={(e) => setSelecionado(e.target.value)}>
              {cursosFiltrados.map((curso) => (
                <FormControlLabel
                  key={curso.nome}
                  value={curso.nome}
                  control={<Radio size="small" />}
                  label={curso.descricao}
                  sx={{
                    mx: 0,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: selecionado === curso.nome ? "primary.main" : "divider",
                    mb: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                />
              ))}
            </RadioGroup>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          onClick={handleSalvar}
          variant="contained"
          disabled={!selecionado || isPending}
          startIcon={isPending ? <CircularProgress size={16} /> : undefined}
        >
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
