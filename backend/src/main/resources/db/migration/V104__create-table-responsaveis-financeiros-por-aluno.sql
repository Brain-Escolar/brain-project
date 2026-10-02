-- Papel financeiro na RELACAO aluno-responsavel, nao como flag global da pessoa.
--
-- Hoje `responsaveis.financeiro` (V45) e um booleano da pessoa: quem e pagante
-- e pagante de todo mundo. Uma pessoa pode ser pagante de um filho e nao de
-- outro, e o rateio entre pais separados nao cabe num booleano.
--
-- Por que tabela nova e nao uma coluna em alunos_responsaveis: aquela e a join
-- table de um @ManyToMany (Responsavel.alunos). O Hibernate apaga e reinsere as
-- linhas dessa tabela ao mexer na colecao, entao uma coluna extra sumiria em
-- silencio na primeira edicao de vinculo. Tabela propria tambem permite vigencia
-- e rateio, que a join nao comportaria.
--
-- `responsaveis.financeiro` NAO e removida: o codigo atual usa, e a troca e um
-- passo separado. Ela passa a ser o legado.

CREATE TABLE alunos_responsaveis_financeiros (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    responsavel_id BIGINT NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    percentual_rateio DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_arf_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    CONSTRAINT fk_arf_responsavel FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id),
    CONSTRAINT chk_arf_percentual CHECK (percentual_rateio >= 0 AND percentual_rateio <= 100),
    CONSTRAINT chk_arf_vigencia CHECK (vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio)
);

-- Um vinculo por aluno/responsavel/inicio de vigencia.
CREATE UNIQUE INDEX uq_arf_vinculo
    ON alunos_responsaveis_financeiros (aluno_id, responsavel_id, vigencia_inicio);

-- "Um pagante principal por aluno entre os vinculos abertos" e regra de
-- servico: UNIQUE parcial nao roda no H2 dos testes.

CREATE INDEX idx_arf_responsavel ON alunos_responsaveis_financeiros (responsavel_id);

-- alunos_responsaveis_financeiros: Quem paga por qual aluno, com quanto e
--   desde quando. A troca de responsavel financeiro no meio do ano se faz
--   fechando a vigencia e abrindo outra linha, nao editando esta -- o titulo
--   ja emitido continua apontando para quem devia.
-- alunos_responsaveis_financeiros.percentual_rateio: Quanto da mensalidade
--   deste aluno cabe a este responsavel. A soma dos vinculos vigentes precisa
--   dar 100 -- CHECK nao cruza linhas, entao a validacao e de servico;
--   ver README-financeiro.md.

CREATE TABLE alunos_responsaveis_financeiros_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aluno_id BIGINT,
    responsavel_id BIGINT,
    principal BOOLEAN,
    percentual_rateio DECIMAL(5,2),
    vigencia_inicio DATE,
    vigencia_fim DATE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_arf_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- ---------------------------------------------------------------------------
-- Backfill a partir da flag global
-- ---------------------------------------------------------------------------
-- Quem tem responsaveis.financeiro = TRUE vira vinculo financeiro do aluno.
-- Quando o aluno tem MAIS DE UM pagante marcado, o de menor id fica com 100% e
-- principal; os demais entram com 0% e principal = FALSE. Assim o total fecha em
-- 100 e ninguem e cobrado em dobro -- e a secretaria revisa pela funcao abaixo,
-- em vez de o sistema adivinhar um rateio que ninguem combinou.
-- INSERT ... SELECT puro, para rodar tambem no H2 dos testes.
INSERT INTO alunos_responsaveis_financeiros
    (aluno_id, responsavel_id, principal, percentual_rateio, vigencia_inicio, atualizado_em)
SELECT c.aluno_id, c.responsavel_id,
       c.posicao = 1,
       CASE WHEN c.posicao = 1 THEN 100.00 ELSE 0.00 END,
       CURRENT_DATE, NOW()
FROM (
    SELECT ar.aluno_id,
           ar.responsavel_id,
           ROW_NUMBER() OVER (PARTITION BY ar.aluno_id ORDER BY ar.responsavel_id) AS posicao
    FROM alunos_responsaveis ar
    JOIN responsaveis r ON r.id = ar.responsavel_id AND r.financeiro = TRUE
) c;

-- As pendencias (aluno sem pagante, rateio que nao soma 100, sem principal)
-- sao uma query do servico sobre esta tabela -- ver README-financeiro.md.

-- responsaveis.financeiro: LEGADO: flag global da pessoa. O papel financeiro
--   real esta em alunos_responsaveis_financeiros, por aluno e com rateio.
