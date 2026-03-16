create table disciplinas(

    id BIGSERIAL NOT NULL,
    unidade_id BIGSERIAL NOT NULL,
    serie_id BIGSERIAL NOT NULL,
    grupo_id BIGINT NOT NULL REFERENCES grupos_disciplinas (id),
    nome VARCHAR(100) NOT NULL,
    carga_horaria VARCHAR(100) NOT NULL,

    primary key(id)
);
