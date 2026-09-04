"use client";

import AlunosView from "@/components/alunosView/AlunosView";

// A listagem de alunos é a mesma para todos os perfis — as diferenças ficam
// dentro de AlunosView, resolvidas por perfil. A rota só aponta para ela.
export default function AlunosOrientacaoPage() {
  return <AlunosView />;
}
