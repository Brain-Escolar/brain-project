-- Ficha médica: laudos passam a ser classificados por tipo e comentados, e as
-- medicações do aluno viram registros próprios (receita, período de uso e a
-- relação de remédios). As alergias continuam nas colunas já existentes de
-- fichas_medicas (alergias_alimentares / alergias_medicamentosas).

ALTER TABLE laudos_medicos
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(30),
    ADD COLUMN IF NOT EXISTS observacao TEXT;

ALTER TABLE laudos_medicos_AUD
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(30),
    ADD COLUMN IF NOT EXISTS observacao TEXT;

-- Laudos já existentes não têm classificação; OUTRO é o valor neutro do enum.
UPDATE laudos_medicos SET tipo = 'OUTRO' WHERE tipo IS NULL;

CREATE TABLE medicacoes (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    ficha_medica_id BIGINT NOT NULL,
    arquivo_id BIGINT,
    tipo_uso VARCHAR(20) NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    medicamentos TEXT,
    observacao TEXT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_medicacoes_ficha_medica FOREIGN KEY (ficha_medica_id)
        REFERENCES fichas_medicas(id) ON DELETE CASCADE,
    CONSTRAINT fk_medicacoes_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivos(id)
);

CREATE INDEX idx_medicacoes_ficha_medica ON medicacoes (ficha_medica_id);

CREATE TABLE IF NOT EXISTS medicacoes_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    ficha_medica_id BIGINT,
    arquivo_id BIGINT,
    tipo_uso VARCHAR(20),
    data_inicio DATE,
    data_fim DATE,
    medicamentos TEXT,
    observacao TEXT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_medicacoes_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
