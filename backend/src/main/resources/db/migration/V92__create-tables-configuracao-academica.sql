-- Configuração acadêmica da escola (tenant), base dinâmica do boletim:
--  * configuracoes_escola: escala de avaliação — constante da escola (linha única,
--    garantida pelo CHECK id = 1; o schema-per-tenant já isola por escola).
--  * periodos_letivos: períodos por ano letivo (bimestre/trimestre/semestre/anual).

CREATE TABLE configuracoes_escola (
    id BIGINT DEFAULT 1 PRIMARY KEY,
    escala_tipo VARCHAR(20) NOT NULL,
    escala_min DECIMAL(6,2) NOT NULL,
    escala_max DECIMAL(6,2) NOT NULL,
    escala_valor_aprovacao DECIMAL(6,2) NOT NULL,
    escala_casas_decimais INTEGER NOT NULL,
    escala_label VARCHAR(60),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT chk_configuracoes_escola_singleton CHECK (id = 1)
);

CREATE TABLE periodos_letivos (
    id BIGSERIAL PRIMARY KEY,
    ano_letivo INTEGER NOT NULL,
    nome VARCHAR(40) NOT NULL,
    sequencia INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT uq_periodos_letivos_ano_sequencia UNIQUE (ano_letivo, sequencia)
);
