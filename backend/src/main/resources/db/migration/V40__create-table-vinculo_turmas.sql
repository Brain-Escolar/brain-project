CREATE TABLE vinculo_turmas (
    id BIGSERIAL NOT NULL,
    unidade_id BIGINT NOT NULL,
    serie_id BIGINT NOT NULL,
    turma_id BIGINT NOT NULL,
    turno VARCHAR(50) NOT NULL,
    data_vigencia TIMESTAMP,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (unidade_id) REFERENCES unidades(id),
    FOREIGN KEY (serie_id) REFERENCES series(id),
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);
