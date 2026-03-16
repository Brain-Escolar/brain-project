CREATE TABLE grades_curriculares (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    versao VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_por BIGINT,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id),
    FOREIGN KEY (criado_por) REFERENCES dados_pessoais(id)
);
