-- Matricula vira a fonte da verdade de "em que turma o aluno esta em cada ano".
--
-- Ate aqui havia dois lugares: alunos.turma_id (gravado pelo cadastro do aluno
-- e pela tela da turma) e matriculas.turma_id (gravado pela efetivacao do CRM),
-- sem sincronia entre eles. Aluno enturmado pela tela da turma nao tinha
-- matricula, e o historico escolar tinha que adivinhar as turmas antigas a
-- partir de notas e chamadas.
--
-- Daqui em diante a lista de alunos de uma turma sai de matriculas, e
-- alunos.turma_id/serie_id/unidade_id passam a ser so o cache da matricula do
-- ano corrente (EnturmacaoService mantem os dois em sincronia).
--
-- Esta migration so cria a linha que faltava. Nada em alunos muda.

-- 1. Matricula viva do ano da turma do aluno, mas sem turma ou com outra
--    (efetivada pelo CRM e enturmada/remanejada depois pela tela da turma):
--    recebe a turma do aluno, que e a que as telas vinham mostrando.
UPDATE matriculas
   SET turma_id = (SELECT a.turma_id FROM alunos a WHERE a.id = matriculas.aluno_id)
 WHERE status IN ('PRE_MATRICULA', 'EFETIVADA')
   AND EXISTS (SELECT 1
                 FROM alunos a
                 JOIN turmas t ON t.id = a.turma_id
                WHERE a.id = matriculas.aluno_id
                  AND t.ano_letivo = matriculas.ano_letivo
                  AND (matriculas.turma_id IS NULL OR matriculas.turma_id <> a.turma_id));

-- 2. Aluno enturmado sem nenhuma matricula no ano da turma: cria. Quem ainda
--    esta matriculado entra EFETIVADA (o CHECK do banco exige data de
--    efetivacao; a de cadastro do aluno e o melhor palpite). Quem ja foi
--    desmatriculado entra CANCELADA, com a data e o motivo que o aluno guarda --
--    ele esteve na turma, e o historico precisa disso.
INSERT INTO matriculas (aluno_id, ano_letivo, unidade_id, serie_id, turma_id, turno, status,
                        data_efetivacao, data_saida, motivo_saida)
SELECT a.id,
       t.ano_letivo,
       COALESCE(t.unidade_id, a.unidade_id),
       COALESCE(t.serie_id, a.serie_id),
       t.id,
       t.turno,
       CASE WHEN a.matriculado = TRUE THEN 'EFETIVADA' ELSE 'CANCELADA' END,
       COALESCE(CAST(a.criado_em AS DATE), CURRENT_DATE),
       CASE WHEN a.matriculado = TRUE THEN NULL ELSE COALESCE(a.data_desmatricula, CURRENT_DATE) END,
       CASE WHEN a.matriculado = TRUE THEN NULL ELSE a.motivo_desmatricula END
  FROM alunos a
  JOIN turmas t ON t.id = a.turma_id
 WHERE COALESCE(t.unidade_id, a.unidade_id) IS NOT NULL
   AND COALESCE(t.serie_id, a.serie_id) IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM matriculas m
                    WHERE m.aluno_id = a.id
                      AND m.ano_letivo = t.ano_letivo
                      AND (m.turma_id = t.id OR m.status IN ('PRE_MATRICULA', 'EFETIVADA')));

-- A lista de alunos de uma turma passa a ser esta consulta.
CREATE INDEX idx_matriculas_turma_status ON matriculas (turma_id, status);
