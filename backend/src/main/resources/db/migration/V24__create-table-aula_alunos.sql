CREATE TABLE aula_alunos (
    aula_id BIGINT NOT NULL,
    aluno_id BIGINT NOT NULL,
    PRIMARY KEY (aula_id, aluno_id),
    CONSTRAINT fk_aula_alunos_aula
        FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
    CONSTRAINT fk_aula_alunos_aluno
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);
