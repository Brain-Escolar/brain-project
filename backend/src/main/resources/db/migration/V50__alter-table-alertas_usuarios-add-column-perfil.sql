DROP TABLE IF EXISTS alertas_usuarios;

CREATE TABLE alertas_usuarios (
    alerta_id BIGINT NOT NULL,
    dados_pessoais_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (alerta_id, dados_pessoais_id, perfil_id),

    CONSTRAINT fk_alerta FOREIGN KEY (alerta_id) REFERENCES alertas(id),
    CONSTRAINT fk_dados_pessoais FOREIGN KEY (dados_pessoais_id) REFERENCES dados_pessoais(id),
    CONSTRAINT fk_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id)
);
