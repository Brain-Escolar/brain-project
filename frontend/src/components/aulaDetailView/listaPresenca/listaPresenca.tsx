import { useAula } from "@/hooks/useAula";
import { useAtualizarChamada, useChamadaDaAula, useSalvarChamada } from "@/hooks/useChamada";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import Link from "next/link";
import { RoutesEnum } from "@/enums/RoutesEnum";

interface IListaPresencaProps {
  idAula?: string;
  data: string;
}

function ListaPresenca({ idAula, data }: IListaPresencaProps) {
  const { alunos, loading, error } = useAula({ idAula: idAula || "" });
  const { chamadas, carregando: carregandoChamada } = useChamadaDaAula(idAula || "", data);
  const { salvarChamada, salvando } = useSalvarChamada(idAula || "", data);
  const { atualizarChamada, atualizando } = useAtualizarChamada(idAula || "", data);

  const chamadaExistente = chamadas.length > 0;

  const [alunosPresentes, setAlunosPresentes] = useState<Set<number>>(new Set());
  const [presencasOriginais, setPresencasOriginais] = useState<Set<number>>(new Set());

  useEffect(() => {
    const ids = chamadas.filter((c) => c.presente).map((c) => c.alunoId);
    setAlunosPresentes(new Set(ids));
    setPresencasOriginais(new Set(ids));
  }, [chamadas]);

  const hasChanges = useMemo(() => {
    if (!chamadaExistente) return alunosPresentes.size > 0 || alunos.length > 0;
    if (alunosPresentes.size !== presencasOriginais.size) return true;
    for (const id of alunosPresentes) {
      if (!presencasOriginais.has(id)) return true;
    }
    return false;
  }, [alunosPresentes, presencasOriginais, chamadaExistente, alunos.length]);

  const handleCheckboxChange = (alunoId: number) => {
    setAlunosPresentes((prev) => {
      const next = new Set(prev);
      if (next.has(alunoId)) {
        next.delete(alunoId);
      } else {
        next.add(alunoId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (alunosPresentes.size === alunos.length) {
      setAlunosPresentes(new Set());
    } else {
      setAlunosPresentes(new Set(alunos.map((a) => a.id)));
    }
  };

  const handleSalvarPresenca = async () => {
    if (!idAula) return;
    const presencas = alunos.map((aluno) => ({
      alunoId: aluno.id,
      presente: alunosPresentes.has(aluno.id),
    }));
    try {
      if (chamadaExistente) {
        await atualizarChamada(presencas);
        toast.success("Chamada atualizada com sucesso!");
      } else {
        await salvarChamada(presencas);
        toast.success("Chamada registrada com sucesso!");
      }
    } catch {
      toast.error("Erro ao salvar chamada. Tente novamente.");
    }
  };

  if ((loading || carregandoChamada) && idAula) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && idAula) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!idAula) return null;
  if (alunos.length === 0) {
    return <BrainResultNotFound message="Nenhum aluno encontrado para esta aula." />;
  }

  const isSaving = salvando || atualizando;

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: "none" }}>
        <Table size="small">
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "45%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    size="small"
                    checked={alunosPresentes.size === alunos.length && alunos.length > 0}
                    indeterminate={alunosPresentes.size > 0 && alunosPresentes.size < alunos.length}
                    onChange={handleSelectAll}
                    sx={{ p: 0 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Presenca
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Nome
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Registros no bim.
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Faltas
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunos.map((aluno) => {
              const selected = alunosPresentes.has(aluno.id);
              return (
                <TableRow
                  key={aluno.id}
                  sx={{
                    bgcolor: selected ? "primary.50" : "inherit",
                    "&:hover": { bgcolor: selected ? "primary.50" : "action.hover" },
                  }}
                >
                  <TableCell sx={{ py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Checkbox
                        size="small"
                        checked={selected}
                        onChange={() => handleCheckboxChange(aluno.id)}
                        color="primary"
                        sx={{ p: 0 }}
                      />
                      <Typography variant="body2" color={selected ? "primary.main" : "text.primary"}>
                        Presente
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Typography
                      variant="body2"
                      component={Link}
                      href={`${RoutesEnum.ALUNO_DETALHE}/${aluno.id}`}
                      sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                    >
                      {aluno.nome}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography variant="body2">{aluno.registros}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography variant="body2">{aluno.faltas}</Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSalvarPresenca}
          disabled={isSaving || alunos.length === 0 || !hasChanges}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : chamadaExistente ? "ATUALIZAR" : "SALVAR"}
        </Button>
      </Box>
    </Box>
  );
}

export default ListaPresenca;
