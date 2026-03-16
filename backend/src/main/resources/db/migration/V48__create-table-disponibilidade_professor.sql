CREATE TABLE disponibilidade_professor (
    id BIGSERIAL PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    horario_id BIGINT NOT NULL,
    data_vigencia DATE,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (professor_id) REFERENCES professores(id),
    FOREIGN KEY (horario_id) REFERENCES horarios(id),
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);
