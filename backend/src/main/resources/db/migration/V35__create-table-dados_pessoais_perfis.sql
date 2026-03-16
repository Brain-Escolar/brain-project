CREATE TABLE dados_pessoais_perfis(
    dados_pessoais_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,

    PRIMARY KEY(dados_pessoais_id, perfil_id),
    CONSTRAINT DADOS_PESSOAIS_PERFIS_FK_DADOS_PESSOAIS FOREIGN KEY(dados_pessoais_id) REFERENCES dados_pessoais(id),
    CONSTRAINT DADOS_PESSOAIS_PERFIS_FK_PERFIL FOREIGN KEY(perfil_id) REFERENCES perfis(id)
);

DROP TABLE usuarios_perfis;
