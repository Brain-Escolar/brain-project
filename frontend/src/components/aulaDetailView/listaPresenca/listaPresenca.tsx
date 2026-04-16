import { useAula } from "@/hooks/useAula";
import { useState } from "react";
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

interface IListaPresencaProps {
  idAula?: string;
}

function ListaPresenca({ idAula }: IListaPresencaProps) {
  const { alunos, loading, error } = useAula({ idAula: idAula || "" });
  const [alunosPresentes, setAlunosPresentes] = useState<string[]>([]);

  const handleCheckboxChange = (alunoId: string) => {
    setAlunosPresentes((prev) => {
      if (prev.includes(alunoId)) {
        return prev.filter((id) => id !== alunoId);
      } else {
        return [...prev, alunoId];
      }
    });
  };

  const handleSelectAll = () => {
    if (alunosPresentes.length === alunos.length) {
      setAlunosPresentes([]);
    } else {
      setAlunosPresentes(alunos.map((aluno) => aluno.id));
    }
  };

  const handleSalvarPresenca = () => {
    if (!idAula) return;
    if (alunosPresentes.length === 0) {
      toast.error("Selecione pelo menos um aluno para marcar presenca.");
      return;
    }
    toast.success("Presenca salva com sucesso!");
    setAlunosPresentes([]);
    // TODO: Integrar com API para salvar presenca
  };

  if (loading && idAula) {
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

  const isSelected = (id: string) => alunosPresentes.indexOf(id) !== -1;
  if (!idAula) return null;
  if (alunos.length === 0) {
    return <BrainResultNotFound message="Nenhum aluno encontrado para esta aula." />;
  }

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
                    checked={alunosPresentes.length === alunos.length && alunos.length > 0}
                    indeterminate={
                      alunosPresentes.length > 0 && alunosPresentes.length < alunos.length
                    }
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
              const selected = isSelected(aluno.id);
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
                    <Typography variant="body2">{aluno.nome}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography variant="body2">{aluno.faltas}</Typography>
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
        <Button variant="contained" onClick={handleSalvarPresenca}>
          SALVAR
        </Button>
      </Box>
    </Box>
  );
}

export default ListaPresenca;
