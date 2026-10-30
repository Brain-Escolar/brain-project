-- Resultado final do ano, congelado no encerramento.
--
-- Ate aqui boletim e historico recalculavam tudo a partir das notas e da
-- escala vigente. Depois que o ano encerra isso e perigoso: mudar a escala
-- (nota de aprovacao 6 -> 7) ou o calendario mudaria, em silencio, a situacao
-- de quem ja foi aprovado. No encerramento o resultado e gravado e o
-- historico passa a ler daqui -- e o mesmo principio do snapshot de
-- valor_pago em alunos_produtos.
--
-- Fica fora da auditoria de proposito: e escrito uma vez, no encerramento, e
-- nunca alterado.

ALTER TABLE matriculas ADD COLUMN situacao_final VARCHAR(20);
ALTER TABLE matriculas ADD COLUMN media_final DECIMAL(6,2);
ALTER TABLE matriculas ADD COLUMN frequencia_final DECIMAL(5,2);
ALTER TABLE matriculas_AUD ADD COLUMN situacao_final VARCHAR(20);
ALTER TABLE matriculas_AUD ADD COLUMN media_final DECIMAL(6,2);
ALTER TABLE matriculas_AUD ADD COLUMN frequencia_final DECIMAL(5,2);

CREATE TABLE resultados_disciplinas (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL,
    disciplina_id BIGINT,
    disciplina_nome VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    carga_horaria INTEGER,
    nota_anual DECIMAL(6,2),
    recuperacao DECIMAL(6,2),
    nota_final DECIMAL(6,2),
    total_faltas INTEGER,
    total_aulas INTEGER,
    frequencia DECIMAL(5,2),
    situacao VARCHAR(20),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_resultados_disciplinas_matricula FOREIGN KEY (matricula_id) REFERENCES matriculas (id),
    CONSTRAINT fk_resultados_disciplinas_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas (id),
    CONSTRAINT uq_resultados_disciplinas UNIQUE (matricula_id, disciplina_id)
);

-- matriculas.situacao_final: APROVADO / REPROVADO / EM_ANDAMENTO (faltou nota
--   em alguma disciplina) no encerramento do ano. Nulo enquanto o ano corre.
-- resultados_disciplinas.disciplina_nome/area/carga_horaria: copiados no
--   encerramento -- disciplina renomeada depois nao reescreve historico.
