CREATE TABLE IF NOT EXISTS laudo_medico (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    ficha_medica_id BIGINT NOT NULL,
    s3_key VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255),
    content_type VARCHAR(100),
    tamanho BIGINT,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id),
    FOREIGN KEY (ficha_medica_id) REFERENCES fichas_medicas(id) ON DELETE CASCADE
);
