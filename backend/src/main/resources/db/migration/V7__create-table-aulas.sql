create table aulas(
    id BIGSERIAL NOT NULL,
    disciplina_id BIGINT NOT NULL REFERENCES disciplinas(id),
    turma BIGINT NOT NULL,
    professor_id BIGINT REFERENCES professores(id),
    horario_id BIGINT,

    primary key(id)
);
