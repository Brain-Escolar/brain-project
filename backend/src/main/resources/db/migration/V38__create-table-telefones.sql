CREATE TABLE telefones (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(15) NOT NULL,
    dados_pessoais_id BIGINT NOT NULL,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_por BIGINT,
    CONSTRAINT fk_telefone_dados_pessoais FOREIGN KEY (dados_pessoais_id) REFERENCES dados_pessoais(id)
);
