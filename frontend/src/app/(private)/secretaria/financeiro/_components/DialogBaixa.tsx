"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFinanceiroMutations } from "@/hooks/useFinanceiroMutations";
import { FormaPagamento } from "@/services/domains/financeiro";
import { ParcelaParaBaixa } from "./ParcelaParaBaixa";
import { dataBR, hojeISO, moeda } from "./formatos";

const FORMAS: { valor: FormaPagamento; rotulo: string }[] = [
  { valor: "PIX", rotulo: "Pix" },
  { valor: "DINHEIRO", rotulo: "Dinheiro" },
  { valor: "BOLETO", rotulo: "Boleto" },
  { valor: "TRANSFERENCIA", rotulo: "Transferência" },
  { valor: "CARTAO_DEBITO", rotulo: "Cartão de débito" },
  { valor: "CARTAO_CREDITO", rotulo: "Cartão de crédito" },
  { valor: "CHEQUE", rotulo: "Cheque" },
  { valor: "OUTRO", rotulo: "Outro" },
];

interface Props {
  parcela: ParcelaParaBaixa | null;
  onClose: () => void;
}

/**
 * Baixa manual de uma parcela.
 *
 * O caso comum tem de ser dois cliques: a parcela já traz o valor e a data é
 * hoje, então a secretaria escolhe a forma e confirma. Valor e data ficam
 * editáveis para o que foge disso — Pix que caiu no sábado e foi lançado na
 * segunda, boleto pago com juros.
 */
export default function DialogBaixa({ parcela, onClose }: Props) {
  const { baixar } = useFinanceiroMutations();

  const [forma, setForma] = useState<FormaPagamento>("PIX");
  const [dataPagamento, setDataPagamento] = useState(hojeISO());
  const [valorPago, setValorPago] = useState("");
  const [observacao, setObservacao] = useState("");

  /** Reseta a cada parcela: formulário sujo da anterior é baixa no aluno errado. */
  useEffect(() => {
    if (parcela) {
      setForma("PIX");
      setDataPagamento(hojeISO());
      setValorPago("");
      setObservacao("");
    }
  }, [parcela]);

  if (!parcela) return null;

  const valorDigitado = valorPago.trim() === "" ? null : Number(valorPago.replace(",", "."));
  const valorInvalido = valorDigitado != null && (Number.isNaN(valorDigitado) || valorDigitado <= 0);
  const abaixoDoLiquido = valorDigitado != null && !valorInvalido && valorDigitado < parcela.valorLiquido;
  const acimaDoLiquido = valorDigitado != null && !valorInvalido && valorDigitado > parcela.valorLiquido;
  const dataNoFuturo = dataPagamento > hojeISO();

  const impedido = valorInvalido || abaixoDoLiquido || dataNoFuturo;

  function confirmar() {
    baixar.mutate(
      {
        tituloId: parcela!.tituloId,
        dados: {
          forma,
          dataPagamento,
          valorPago: valorDigitado ?? undefined,
          observacao: observacao.trim() || undefined,
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dar baixa na parcela {parcela.numeroParcela}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {parcela.alunoNome ? `${parcela.alunoNome} · ` : ""}
          {parcela.contratoNumero ? `${parcela.contratoNumero} · ` : ""}
          vencimento {dataBR(parcela.vencimento)} · {moeda(parcela.valorLiquido)}
        </Typography>

        <Stack spacing={2}>
          <TextField
            select
            label="Forma de pagamento"
            value={forma}
            onChange={(e) => setForma(e.target.value as FormaPagamento)}
            fullWidth
          >
            {FORMAS.map((f) => (
              <MenuItem key={f.valor} value={f.valor}>
                {f.rotulo}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Data do pagamento"
            type="date"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Quando o dinheiro entrou, não quando está sendo lançado."
            error={dataNoFuturo}
            fullWidth
          />

          <TextField
            label="Valor pago"
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
            placeholder={parcela.valorLiquido.toFixed(2)}
            helperText={`Em branco, usa o valor da parcela (${moeda(parcela.valorLiquido)}).`}
            error={valorInvalido || abaixoDoLiquido}
            fullWidth
          />

          <TextField
            label="Observação"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>

        {dataNoFuturo && (
          <Alert severity="error" sx={{ mt: 2 }}>
            A data do pagamento não pode estar no futuro. Dinheiro que ainda não entrou não se dá
            baixa.
          </Alert>
        )}

        {valorInvalido && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Valor inválido. Use ponto ou vírgula para os centavos.
          </Alert>
        )}

        {abaixoDoLiquido && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Baixa parcial não é possível. Receber menos que a parcela deixaria um saldo que nenhum
            relatório cobra — para receber {moeda(valorDigitado)}, renegocie a parcela.
          </Alert>
        )}

        {acimaDoLiquido && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {moeda(valorDigitado! - parcela.valorLiquido)} acima do valor da parcela. Será
            registrado como pago — normalmente é juros ou multa.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={baixar.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={confirmar}
          disabled={impedido || baixar.isPending}
        >
          {baixar.isPending ? "Registrando..." : "Registrar baixa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
