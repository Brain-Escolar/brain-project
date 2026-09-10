-- Medicações em uso do aluno, ligadas à ficha médica.
--
-- Cadastradas pelo responsável no Portal do Responsável e consultadas pela
-- Orientação. Não há remoção pelo responsável de propósito: é dado de saúde
-- de menor, e o histórico fica preservado — desativar é da escola.
--
-- `criado_por` (herdado de EntidadeBase via auditoria do Spring) registra
-- quem incluiu, o que permite distinguir o que veio da família do que veio
-- da escola.

CREATE TABLE medicacoes (
    id BIGSERIAL PRIMARY KEY,
    ficha_medica_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    dosagem VARCHAR(255),
    horario VARCHAR(255),
    observacao VARCHAR(500),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_medicacoes_ficha_medica FOREIGN KEY (ficha_medica_id)
        REFERENCES fichas_medicas(id) ON DELETE CASCADE
);

CREATE INDEX idx_medicacoes_ficha_medica ON medicacoes (ficha_medica_id);

CREATE TABLE medicacoes_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    ficha_medica_id BIGINT,
    nome VARCHAR(255),
    dosagem VARCHAR(255),
    horario VARCHAR(255),
    observacao VARCHAR(500),
    ativa BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_medicacoes_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
