"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useCrmMutations } from "@/hooks/useCrmMutations";
import { useCrmOrigens } from "@/hooks/useCrmEstagios";
import { useCrmEquipe } from "@/hooks/useCrmEquipe";
import { useSeries } from "@/hooks/useSeries";
import { useAlunos } from "@/hooks/useAlunos";
import { useDesmatriculados } from "@/hooks/useDesmatriculados";
import { CadastroLeadCrmRequest, TipoProcessoCrm } from "@/services/domains/crm";
import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { RoutesEnum } from "@/enums";

interface NovoLeadDialogProps {
  open: boolean;
  onClose: () => void;
}

const ANO_ATUAL = new Date().getFullYear();

function situacaoAluno(aluno: AlunoListaResponse): string {
  return aluno.matriculado ? "Matriculado" : "Desmatriculado";
}

export default function NovoLeadDialog({ open, onClose }: NovoLeadDialogProps) {
  const router = useRouter();
  const { criarLead } = useCrmMutations();
  const { origens } = useCrmOrigens();
  const { equipe } = useCrmEquipe();
  const { series } = useSeries();
  const { alunos: matriculados } = useAlunos();
  const { desmatriculados } = useDesmatriculados();

  const [tipo, setTipo] = useState<TipoProcessoCrm>("NOVA");
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoListaResponse | null>(null);
  const [nomeAluno, setNomeAluno] = useState("");
  const [email, setEmail] = useState("");
  const [serieId, setSerieId] = useState<number | "">("");
  const [anoLetivo, setAnoLetivo] = useState(ANO_ATUAL);
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  const [origemId, setOrigemId] = useState<number | "">("");
  const [funcionarioId, setFuncionarioId] = useState<number | "">("");

  // Rematrícula reaproveita um aluno já cadastrado (matriculado hoje, de olho no
  // próximo ciclo, ou já desmatriculado) — nunca cadastra um Aluno/DadosPessoais novo.
  const alunosParaRematricula = useMemo(
    () => [...matriculados, ...desmatriculados],
    [matriculados, desmatriculados],
  );

  function limpar() {
    setTipo("NOVA");
    setAlunoSelecionado(null);
    setNomeAluno("");
    setEmail("");
    setSerieId("");
    setAnoLetivo(ANO_ATUAL);
    setResponsavelNome("");
    setResponsavelTelefone("");
    setOrigemId("");
    setFuncionarioId("");
  }

  function fechar() {
    limpar();
    onClose();
  }

  const ehRematricula = tipo === "REMATRICULA";
  const semDados = ehRematricula
    ? !alunoSelecionado || !origemId
    : !nomeAluno.trim() || !email.trim() || !origemId;

  async function confirmar() {
    const dados: CadastroLeadCrmRequest = {
      alunoId: ehRematricula ? (alunoSelecionado?.id ?? undefined) : undefined,
      nomeAluno: ehRematricula ? undefined : nomeAluno,
      email: ehRematricula ? undefined : email,
      serieId: serieId === "" ? undefined : Number(serieId),
      anoLetivo,
      tipo,
      origemId: Number(origemId),
      responsavelNome: responsavelNome || undefined,
      responsavelTelefone: responsavelTelefone || undefined,
      funcionarioId: funcionarioId === "" ? undefined : Number(funcionarioId),
    };
    const processo = await criarLead.mutateAsync(dados);
    fechar();
    router.push(`${RoutesEnum.SECRETARIA_CRM}/${processo.id}`);
  }

  return (
    <Dialog open={open} onClose={fechar} maxWidth="sm" fullWidth>
      <DialogTitle>Novo lead</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label="Matrícula nova"
            color={tipo === "NOVA" ? "primary" : "default"}
            onClick={() => setTipo("NOVA")}
          />
          <Chip
            label="Rematrícula"
            color={ehRematricula ? "primary" : "default"}
            onClick={() => setTipo("REMATRICULA")}
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {ehRematricula ? (
            <Autocomplete
              sx={{ gridColumn: "1 / -1" }}
              options={alunosParaRematricula}
              value={alunoSelecionado}
              onChange={(_, value) => setAlunoSelecionado(value)}
              getOptionLabel={(a) => a.nome}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderOption={(props, aluno) => (
                <li {...props} key={aluno.id}>
                  <Box>
                    <Typography variant="body2">{aluno.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {situacaoAluno(aluno)} · {aluno.matricula || aluno.cpf || "sem matrícula"}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Aluno já cadastrado" required />
              )}
            />
          ) : (
            <>
              <TextField
                label="Nome do aluno"
                value={nomeAluno}
                onChange={(e) => setNomeAluno(e.target.value)}
                sx={{ gridColumn: "1 / -1" }}
                required
              />
              <TextField
                label="E-mail do aluno"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ gridColumn: "1 / -1" }}
                required
              />
            </>
          )}
          <Select<number | "">
            displayEmpty
            value={serieId}
            onChange={(e) => setSerieId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <MenuItem value="">Série pretendida</MenuItem>
            {series.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.nome}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Ciclo letivo"
            type="number"
            value={anoLetivo}
            onChange={(e) => setAnoLetivo(Number(e.target.value))}
          />
          <TextField
            label="Responsável"
            value={responsavelNome}
            onChange={(e) => setResponsavelNome(e.target.value)}
          />
          <TextField
            label="Telefone / WhatsApp"
            value={responsavelTelefone}
            onChange={(e) => setResponsavelTelefone(e.target.value)}
          />
          <Select<number | "">
            displayEmpty
            value={origemId}
            onChange={(e) => setOrigemId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <MenuItem value="">Origem do lead *</MenuItem>
            {origens.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.nome}
              </MenuItem>
            ))}
          </Select>
          <Select<number | "">
            displayEmpty
            value={funcionarioId}
            onChange={(e) => setFuncionarioId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <MenuItem value="">Distribuir pela fila</MenuItem>
            {equipe.map((f) => (
              <MenuItem key={f.funcionarioId} value={f.funcionarioId}>
                {f.nome}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {!funcionarioId && (
          <Alert severity="info" variant="outlined">
            Sem responsável definido, o lead entra na fila e pode ser distribuído depois na aba
            Fila.
          </Alert>
        )}
        <Typography variant="caption" color="text.secondary">
          {ehRematricula
            ? "* campos obrigatórios: aluno e origem."
            : "* campos obrigatórios: nome do aluno, e-mail e origem."}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={fechar} disabled={criarLead.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={confirmar}
          disabled={semDados || criarLead.isPending}
        >
          Criar lead
        </Button>
      </DialogActions>
    </Dialog>
  );
}
