-- Ano letivo vira entidade.
--
-- Ate aqui "ano letivo" era um INTEGER solto em turmas, matriculas e
-- periodos_letivos, e o "ano corrente" era o ano do calendario
-- (LocalDate.now().getYear()) espalhado pelos servicos. Isso nao deixa a escola
-- preparar o ano seguinte em dezembro, nem dizer que o ano passado acabou.
--
-- A chave e o proprio ano (2026), e nao um id sintetico: e assim que o resto do
-- banco ja se refere a ele, entao as colunas ano_letivo existentes viram FK sem
-- reescrever nenhum dado.
--
-- Ciclo de vida:
--   PLANEJAMENTO -> turmas, matriculas e precos do ano podem ser montados, mas
--                   ele ainda nao e o ano corrente.
--   ABERTO       -> o ano corrente. No maximo um por vez (regra do servico).
--   ENCERRADO    -> somente leitura.

CREATE TABLE anos_letivos (
    ano INTEGER PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    aberto_em TIMESTAMPTZ,
    encerrado_em TIMESTAMPTZ,
    sem_periodos BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT chk_anos_letivos_status CHECK (status IN ('PLANEJAMENTO', 'ABERTO', 'ENCERRADO')),
    CONSTRAINT chk_anos_letivos_datas CHECK (data_fim > data_inicio)
);

-- Auditado: quem abriu ou encerrou um ano, e quando, e o tipo de coisa que se
-- quer reconstruir depois.
CREATE TABLE anos_letivos_AUD (
    ano INTEGER NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    status VARCHAR(20),
    data_inicio DATE,
    data_fim DATE,
    aberto_em TIMESTAMPTZ,
    encerrado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (ano, rev),
    CONSTRAINT fk_anos_letivos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- Turma.anoLetivo e int primitivo: turma cadastrada sem ano ficou com 0. Sem
-- consertar isso a FK abaixo nao entra. O ano de criacao e o melhor palpite.
UPDATE turmas
   SET ano_letivo = COALESCE(EXTRACT(YEAR FROM criado_em), EXTRACT(YEAR FROM CURRENT_DATE))
 WHERE ano_letivo IS NULL OR ano_letivo < 2000;

-- Um ano para cada ano ja usado, mais o ano corrente. Os anteriores entram
-- ENCERRADOS, o atual ABERTO, os futuros em PLANEJAMENTO.
INSERT INTO anos_letivos (ano, status, data_inicio, data_fim)
SELECT anos.ano,
       CASE
           WHEN anos.ano < EXTRACT(YEAR FROM CURRENT_DATE) THEN 'ENCERRADO'
           WHEN anos.ano = EXTRACT(YEAR FROM CURRENT_DATE) THEN 'ABERTO'
           ELSE 'PLANEJAMENTO'
       END,
       CAST(CONCAT(anos.ano, '-02-01') AS DATE),
       CAST(CONCAT(anos.ano, '-12-20') AS DATE)
  FROM (SELECT ano_letivo AS ano FROM turmas
        UNION SELECT ano_letivo FROM matriculas
        UNION SELECT ano_letivo FROM periodos_letivos
        UNION SELECT CAST(EXTRACT(YEAR FROM CURRENT_DATE) AS INTEGER)) anos
 WHERE anos.ano IS NOT NULL;

UPDATE anos_letivos SET aberto_em = CURRENT_TIMESTAMP WHERE status IN ('ABERTO', 'ENCERRADO');
UPDATE anos_letivos SET encerrado_em = CURRENT_TIMESTAMP WHERE status = 'ENCERRADO';

-- Datas do ano: quando a escola ja configurou periodos, o ano vai do inicio do
-- primeiro ao fim do ultimo.
UPDATE anos_letivos
   SET data_inicio = (SELECT MIN(p.data_inicio) FROM periodos_letivos p WHERE p.ano_letivo = anos_letivos.ano),
       data_fim = (SELECT MAX(p.data_fim) FROM periodos_letivos p WHERE p.ano_letivo = anos_letivos.ano)
 WHERE EXISTS (SELECT 1 FROM periodos_letivos p WHERE p.ano_letivo = anos_letivos.ano);

-- Periodos passam a existir no banco para todo ano. Antes, ano sem periodo
-- caia num padrao montado em memoria (4 bimestres com ids 1..4 inventados) --
-- e nada pode apontar para um periodo que nao existe.
--
-- sem_periodos e marcado antes do INSERT porque o INSERT le e escreve a mesma
-- tabela; a coluna sai no fim desta migration.
UPDATE anos_letivos
   SET sem_periodos = NOT EXISTS (SELECT 1 FROM periodos_letivos p WHERE p.ano_letivo = anos_letivos.ano);

INSERT INTO periodos_letivos (ano_letivo, nome, sequencia, data_inicio, data_fim)
SELECT a.ano, b.nome, b.sequencia,
       CAST(CONCAT(a.ano, b.inicio) AS DATE),
       CAST(CONCAT(a.ano, b.fim) AS DATE)
  FROM anos_letivos a
 CROSS JOIN (VALUES ('1º Bimestre', 1, '-02-01', '-04-30'),
                    ('2º Bimestre', 2, '-05-01', '-07-15'),
                    ('3º Bimestre', 3, '-07-16', '-09-30'),
                    ('4º Bimestre', 4, '-10-01', '-12-20')) AS b (nome, sequencia, inicio, fim)
 WHERE a.sem_periodos = TRUE;

ALTER TABLE anos_letivos DROP COLUMN sem_periodos;

ALTER TABLE periodos_letivos
    ADD CONSTRAINT fk_periodos_letivos_ano FOREIGN KEY (ano_letivo) REFERENCES anos_letivos (ano);
ALTER TABLE turmas
    ADD CONSTRAINT fk_turmas_ano_letivo FOREIGN KEY (ano_letivo) REFERENCES anos_letivos (ano);
ALTER TABLE matriculas
    ADD CONSTRAINT fk_matriculas_ano_letivo FOREIGN KEY (ano_letivo) REFERENCES anos_letivos (ano);

-- Fora da FK de proposito: processos_matricula, simulacoes_financeiras,
-- politicas_bolsa e produtos_precos falam de um ano que a secretaria ainda esta
-- vendendo, e o CRM nao pode travar porque a direcao nao cadastrou o ano. Elas
-- continuam INTEGER; quem vira matricula ou turma passa pelo
-- AnoLetivoService.garantir(), que cria o ano em PLANEJAMENTO quando falta.
