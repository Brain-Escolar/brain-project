"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useCatalogoMutations } from "@/hooks/useCatalogoMutations";
import { NaturezaProduto } from "@/services/domains/produto";

const NATUREZAS: { valor: NaturezaProduto; rotulo: string; ajuda: string }[] = [
  {
    valor: "RECORRENTE",
    rotulo: "Cobrado todo mês",
    ajuda: "Vira carnê: uma parcela por mês do contrato. Mensalidade, contraturno.",
  },
  {
    valor: "UNICO",
    rotulo: "Cobrado uma vez no ano",
    ajuda: "Vira uma parcela só, na primeira competência. Taxa de matrícula, material didático.",
  },
  {
    valor: "EVENTUAL",
    rotulo: "Avulso",
    ajuda: "Vira uma parcela só, quando contratado. Passeio, segunda chamada.",
  },
];

interface Props {
  aberto: boolean;
  onClose: () => void;
}

/**
 * Cadastro de produto.
 *
 * `natureza` e `permiteBolsa` sao os dois campos que existiam na tabela desde o
 * comeco e nunca tiveram onde ser preenchidos -- e sao exatamente os dois que a
 * efetivacao da matricula le. Produto sem natureza faz a efetivacao recusar; e
 * o que a escola via era "nao consigo matricular", sem dizer por que.
 */
export default function DialogNovoProduto({ aberto, onClose }: Props) {
  const { criarProduto } = useCatalogoMutations();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [natureza, setNatureza] = useState<NaturezaProduto>("RECORRENTE");
  const [permiteBolsa, setPermiteBolsa] = useState(true);

  useEffect(() => {
    if (aberto) {
      setNome("");
      setDescricao("");
      setNatureza("RECORRENTE");
      setPermiteBolsa(true);
    }
  }, [aberto]);

  const explicacao = NATUREZAS.find((n) => n.valor === natureza)?.ajuda ?? "";

  function salvar() {
    criarProduto.mutate(
      {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        natureza,
        permiteBolsa,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open={aberto} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo produto</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Mensalidade Ensino Fundamental"
            fullWidth
          />

          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Como é cobrado"
            value={natureza}
            onChange={(e) => setNatureza(e.target.value as NaturezaProduto)}
            helperText={explicacao}
            fullWidth
          >
            {NATUREZAS.map((n) => (
              <MenuItem key={n.valor} value={n.valor}>
                {n.rotulo}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={permiteBolsa}
                onChange={(e) => setPermiteBolsa(e.target.checked)}
              />
            }
            label="A bolsa incide sobre este produto"
          />

          {!permiteBolsa && (
            <Alert severity="info">
              Sem incidência de bolsa, este item é cobrado cheio mesmo para aluno bolsista. É o
              caso de seguro escolar e material de terceiros.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={criarProduto.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={salvar}
          disabled={nome.trim().length < 2 || criarProduto.isPending}
        >
          {criarProduto.isPending ? "Criando..." : "Criar produto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
