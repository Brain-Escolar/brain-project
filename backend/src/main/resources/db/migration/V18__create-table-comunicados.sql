create table comunicados(
    id BIGSERIAL NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    conteudo VARCHAR(255) NOT NULL,
    data_publicacao DATE NOT NULL,
    primary key(id)
);

create table comunicados_usuario(
    comunicado_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY(comunicado_id, usuario_id),
    CONSTRAINT COMUNICADOS_USUARIO_FK_COMUNICADO FOREIGN KEY(comunicado_id) REFERENCES comunicados(id),
    CONSTRAINT COMUNICADOS_USUARIO_FK_USUARIO FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);
