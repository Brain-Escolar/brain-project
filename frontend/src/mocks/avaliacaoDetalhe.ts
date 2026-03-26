import { AvaliacaoDetalhePageResponse } from "@/services/domains/avaliacao/response";

/**
 * MOCK TEMPORÁRIO — remover quando o endpoint estiver implementado no backend.
 * Endpoints relacionados:
 *   GET  /avaliacao/:id/detalhe  → getAvaliacaoDetalheComAlunos
 *   POST /avaliacao/:id/notas    → salvarNotasAvaliacao
 */
export const mockAvaliacaoDetalhe: AvaliacaoDetalhePageResponse = {
  id: 1,
  nomeAvaliacao: "Prova 1",
  disciplina: "Matemática 1",
  turma: "3ºA",
  abertura: "14/01/25",
  prazo: "14/01/25",
  totalAlunos: 28,
  notasLancadas: 15,
  alunos: [
    { alunoId: 1, nomeAluno: "Ana Clara Santos", nota: 98, falta: false },
    { alunoId: 2, nomeAluno: "Bruno Oliveira Lima", nota: 75, falta: false },
    { alunoId: 3, nomeAluno: "Camila Rodrigues Costa", nota: 88, falta: false },
    { alunoId: 4, nomeAluno: "Daniel Ferreira Souza", nota: null, falta: true },
    { alunoId: 5, nomeAluno: "Elena Martins Pereira", nota: 92, falta: false },
    { alunoId: 6, nomeAluno: "Felipe Alves Nascimento", nota: 67, falta: false },
    { alunoId: 7, nomeAluno: "Gabriela Mendes Araújo", nota: 85, falta: false },
    { alunoId: 8, nomeAluno: "Henrique Barbosa Silva", nota: 90, falta: false },
    { alunoId: 9, nomeAluno: "Isabella Torres Gomes", nota: 78, falta: false },
    { alunoId: 10, nomeAluno: "João Pedro Cardoso", nota: 95, falta: false },
  ],
};
