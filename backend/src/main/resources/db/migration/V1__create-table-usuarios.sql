CREATE TABLE usuarios(

    id BIGSERIAL NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    verificado BOOLEAN NOT NULL DEFAULT TRUE,
    token VARCHAR(64),
    expiracao_token TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    primary key(id)

);
