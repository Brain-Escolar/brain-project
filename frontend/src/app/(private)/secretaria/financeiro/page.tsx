"use client";

import { useState } from "react";
import { Paper, Tab, Tabs } from "@mui/material";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import AbaCarneDoAluno from "./_components/AbaCarneDoAluno";
import AbaInadimplencia from "./_components/AbaInadimplencia";
import DialogBaixa from "./_components/DialogBaixa";
import DialogEstorno from "./_components/DialogEstorno";
import { ParcelaParaBaixa } from "./_components/ParcelaParaBaixa";

/**
 * O financeiro da escola: cobrar e receber.
 *
 * Separado de /financeiro, que é a tela da FAMÍLIA vendo a própria conta. São
 * duas audiências com autorização oposta — lá o vínculo familiar, aqui o perfil
 * de escola — e o backend trata as duas em prefixos diferentes de propósito.
 *
 * Duas abas porque são dois momentos diferentes do mesmo trabalho: a
 * inadimplência é a lista de quem ligar, e o carnê do aluno é onde se registra o
 * pagamento de quem chegou pagando. Sem a segunda, só daria baixa em parcela
 * atrasada — e o caso comum é o pai que paga em dia.
 */
export default function FinanceiroSecretariaPage() {
  const [aba, setAba] = useState(0);
  const [paraBaixar, setParaBaixar] = useState<ParcelaParaBaixa | null>(null);
  const [paraEstornar, setParaEstornar] = useState<ParcelaParaBaixa | null>(null);

  return (
    <PageScaffold
      title="Financeiro"
      description="Inadimplência com aging e baixa de parcelas."
    >
      <Paper variant="outlined" sx={{ mb: 2.5 }}>
        <Tabs value={aba} onChange={(_, valor) => setAba(valor)}>
          <Tab label="Inadimplência" />
          <Tab label="Carnê do aluno" />
        </Tabs>
      </Paper>

      {aba === 0 && <AbaInadimplencia onBaixar={setParaBaixar} />}
      {aba === 1 && (
        <AbaCarneDoAluno onBaixar={setParaBaixar} onEstornar={setParaEstornar} />
      )}

      <DialogBaixa parcela={paraBaixar} onClose={() => setParaBaixar(null)} />
      <DialogEstorno parcela={paraEstornar} onClose={() => setParaEstornar(null)} />
    </PageScaffold>
  );
}
