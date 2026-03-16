CREATE TABLE arquivos (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    s3_key VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255),
    content_type VARCHAR(100),
    tamanho BIGINT,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);
