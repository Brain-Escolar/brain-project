"use client";

import AlunosView from "@/components/alunosView/AlunosView";

// Mesma tela de AlunosView; o perfil ADMIN habilita internamente as ações de
// cadastro (Novo Aluno, Editar, Excluir).
export default function ListaAlunoPage() {
  return <AlunosView />;
}
