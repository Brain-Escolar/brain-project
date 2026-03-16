create table chamadas(
    id BIGSERIAL NOT NULL,
    aula_id BIGINT NOT NULL REFERENCES aulas(id),
    aluno_id BIGINT NOT NULL REFERENCES alunos(id),
    data_chamada DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT FALSE,
    primary key(id)
);
