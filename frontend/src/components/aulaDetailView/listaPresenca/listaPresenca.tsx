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
import * as S from "./styles";
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
      toast.error("Selecione pelo menos um aluno para marcar presença.");
      return;
    }
    toast.success("Presença salva com sucesso!");
    setAlunosPresentes([]);
    // TODO: Integrar com API para salvar presença
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
    <Box sx={{ paddingTop: 0 }}>
      <TableContainer component={Paper} sx={{ p: 0 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>
                <S.AreaCheckbox>
                  <Checkbox
                    checked={alunosPresentes.length === alunos.length && alunos.length > 0}
                    indeterminate={
                      alunosPresentes.length > 0 && alunosPresentes.length < alunos.length
                    }
                    onChange={handleSelectAll}
                  />
                  Presença
                </S.AreaCheckbox>
              </TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Registros no bim.</TableCell>
              <TableCell align="center">Faltas</TableCell>
            </TableRow>
          </TableHead>
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "50%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <TableBody>
            {alunos.map((aluno) => (
              <TableRow
                key={aluno.id}
                sx={{ bgcolor: isSelected(aluno.id) ? "#edf4fb" : "inherit" }}
              >
                <TableCell>
                  <S.AreaCheckbox>
                    <Checkbox
                      checked={alunosPresentes.includes(aluno.id)}
                      onChange={() => handleCheckboxChange(aluno.id)}
                    />
                    Presente
                  </S.AreaCheckbox>
                </TableCell>
                <TableCell>{aluno.nome}</TableCell>
                <TableCell align="center">{aluno.faltas}</TableCell>
                <TableCell align="center">{aluno.faltas}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        variant="contained"
        sx={{ mt: 2, ml: "auto", display: "block" }}
        onClick={handleSalvarPresenca}
      >
        Salvar
      </Button>
    </Box>
  );
}

export default ListaPresenca;
