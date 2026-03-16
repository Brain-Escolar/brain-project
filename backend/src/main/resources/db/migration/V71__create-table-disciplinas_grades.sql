CREATE TABLE disciplinas_grades(
    disciplina_id BIGINT NOT NULL,
    grade_curricular_id BIGINT NOT NULL,
    carga_horaria INTEGER,
    obrigatoria BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_por BIGINT,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id),
    FOREIGN KEY (criado_por) REFERENCES dados_pessoais(id),
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (grade_curricular_id) REFERENCES grades_curriculares(id)
);
