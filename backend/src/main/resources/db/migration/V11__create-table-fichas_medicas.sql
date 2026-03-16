create table fichas_medicas(
    id BIGSERIAL NOT NULL,
    aluno_id BIGINT NOT NULL REFERENCES alunos(id) on delete cascade,
    tipo_sanguineo VARCHAR(11),
    necessidades_especiais VARCHAR(255),
    doencas_respiratorias VARCHAR(255),
    alergias_alimentares VARCHAR(255),
    alergias_medicamentosas VARCHAR(255),
    laudos VARCHAR(255),
    primary key(id)
);
