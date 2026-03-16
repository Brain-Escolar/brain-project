create table grupos_disciplinas(

    id BIGSERIAL NOT NULL,
    nome VARCHAR(100) NOT NULL UNIQUE,
    area VARCHAR(100) NOT NULL,

    primary key(id)
);
