"use client";

import { TipoVinculo } from "@/services/domains/dados-pessoais";
import { Alert, AlertTitle } from "@mui/material";
import { PessoaExistenteEstado } from "./usePessoaExistente";

const NOME_PAPEL: Record<TipoVinculo, string> = {
  ALUNO: "aluno(a)",
  RESPONSAVEL: "responsável",
  PROFESSOR: "professor(a)",
  SECRETARIO: "secretário(a)",
  DIRETOR: "diretor(a)",
  COORDENADOR: "coordenador(a)",
  ORIENTADOR: "orientador(a)",
  RH: "RH",
};

function listar(itens: string[]) {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

/**
 * Aviso exibido abaixo do CPF quando a pessoa já existe no sistema.
 * Sem pessoa achada, não renderiza nada.
 */
export default function PessoaExistenteAviso({ estado }: { estado: PessoaExistenteEstado }) {
  const { pessoa, papel, vinculoNoPapel, conflito } = estado;
  if (!pessoa) return null;

  if (vinculoNoPapel && conflito) {
    return (
      <Alert severity={vinculoNoPapel.ativo ? "error" : "warning"} sx={{ gridColumn: "1 / -1" }}>
        <AlertTitle>
          {pessoa.nome} já é {NOME_PAPEL[papel]}
        </AlertTitle>
        {vinculoNoPapel.ativo
          ? "Este CPF já tem esse cadastro. Edite o cadastro existente em vez de criar outro."
          : "O cadastro está inativo. Reative-o na lista em vez de criar outro."}
      </Alert>
    );
  }

  if (vinculoNoPapel) {
    return (
      <Alert severity="info" sx={{ gridColumn: "1 / -1" }}>
        <AlertTitle>
          {pessoa.nome} já é {NOME_PAPEL[papel]} no sistema
        </AlertTitle>
        Os dados foram preenchidos a partir do cadastro existente, que será reaproveitado.
      </Alert>
    );
  }

  const papeis = pessoa.vinculos.map((v) => v.descricao.toLowerCase());
  return (
    <Alert severity="info" sx={{ gridColumn: "1 / -1" }}>
      <AlertTitle>
        {pessoa.nome} já está no sistema{papeis.length > 0 ? ` como ${listar(papeis)}` : ""}
      </AlertTitle>
      Os dados pessoais foram preenchidos a partir do cadastro existente. Ao salvar, a mesma pessoa
      passa a ser também {NOME_PAPEL[papel]} — sem duplicar o cadastro e, se ela já tiver acesso ao
      sistema, com o mesmo login.
    </Alert>
  );
}
