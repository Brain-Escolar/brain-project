-- Periodo explicito na avaliacao e fechamento de periodo.
--
-- 1) avaliacoes_turmas.periodo_letivo_id: a qual bimestre (trimestre, ...) a
--    avaliacao conta. Ate aqui isso era deduzido da data de cada nota
--    (notas.periodo_referencia), e nao havia como dizer "esta recuperacao,
--    aplicada em 5 de maio, conta para o 1o bimestre". A partir de agora o
--    periodo e o da avaliacao, e periodo_referencia da nota e mantido pelo
--    servico DENTRO desse periodo -- os relatorios continuam lendo a data e
--    passam a acertar o bimestre.
--
-- 2) periodos_letivos.fechado_em: periodo fechado nao aceita nota nem chamada
--    nova, alteracao ou exclusao. E o "fechamento do bimestre" da secretaria:
--    depois dele o boletim do periodo e definitivo. Reabrir e da Direcao.

ALTER TABLE avaliacoes_turmas ADD COLUMN periodo_letivo_id BIGINT;
ALTER TABLE avaliacoes_turmas_AUD ADD COLUMN periodo_letivo_id BIGINT;

ALTER TABLE avaliacoes_turmas
    ADD CONSTRAINT fk_avaliacoes_turmas_periodo FOREIGN KEY (periodo_letivo_id) REFERENCES periodos_letivos (id);
CREATE INDEX idx_avaliacoes_turmas_periodo ON avaliacoes_turmas (periodo_letivo_id);

-- Backfill pela data de aplicacao, no ano da turma.
UPDATE avaliacoes_turmas
   SET periodo_letivo_id = (SELECT p.id
                              FROM periodos_letivos p
                              JOIN turmas t ON t.ano_letivo = p.ano_letivo
                             WHERE t.id = avaliacoes_turmas.turma_id
                               AND avaliacoes_turmas.data_aplicacao BETWEEN p.data_inicio AND p.data_fim)
 WHERE data_aplicacao IS NOT NULL;

-- Sem data de aplicacao (ou fora de qualquer periodo): pela data de
-- referencia das notas ja lancadas, que e o que os relatorios vinham usando.
UPDATE avaliacoes_turmas
   SET periodo_letivo_id = (SELECT MIN(p.id)
                              FROM periodos_letivos p
                              JOIN turmas t ON t.ano_letivo = p.ano_letivo
                              JOIN notas n ON n.avaliacao_turma_id = avaliacoes_turmas.id
                             WHERE t.id = avaliacoes_turmas.turma_id
                               AND n.periodo_referencia BETWEEN p.data_inicio AND p.data_fim)
 WHERE periodo_letivo_id IS NULL;

ALTER TABLE periodos_letivos ADD COLUMN fechado_em TIMESTAMPTZ;

-- avaliacoes_turmas.periodo_letivo_id: Periodo letivo em que a avaliacao
--   conta. Nulo so em avaliacao antiga cuja data nao caiu em periodo nenhum.
-- periodos_letivos.fechado_em: Quando o periodo foi fechado. Nulo = aberto
--   para lancamento.
