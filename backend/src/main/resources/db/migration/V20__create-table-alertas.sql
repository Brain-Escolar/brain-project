create table alertas(
    id BIGSERIAL NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    conteudo VARCHAR(255) NOT NULL,
    data_publicacao DATE NOT NULL,
    primary key(id)
);

create table alertas_usuario(
    alerta_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY(alerta_id, usuario_id),
    CONSTRAINT ALERTAS_USUARIO_FK_ALERTA FOREIGN KEY(alerta_id) REFERENCES alertas(id),
    CONSTRAINT ALERTAS_USUARIO_FK_USUARIO FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);
