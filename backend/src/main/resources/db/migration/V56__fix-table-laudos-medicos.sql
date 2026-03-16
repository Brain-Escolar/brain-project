DROP TABLE IF EXISTS laudo_medico CASCADE;

CREATE TABLE laudos_medicos (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    arquivo_id BIGINT,
    ficha_medica_id BIGINT NOT NULL,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (arquivo_id) REFERENCES arquivos(id),
    FOREIGN KEY (ficha_medica_id) REFERENCES fichas_medicas(id) ON DELETE CASCADE,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);
