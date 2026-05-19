CREATE TABLE conversas (
    id BIGSERIAL PRIMARY KEY,
    remetente_dados_pessoais_id BIGINT NOT NULL,
    remetente_perfil_id BIGINT NOT NULL,
    perfil_destinatario_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_por BIGINT,
    CONSTRAINT fk_conversas_remetente FOREIGN KEY (remetente_dados_pessoais_id) REFERENCES dados_pessoais(id),
    CONSTRAINT fk_conversas_remetente_perfil FOREIGN KEY (remetente_perfil_id) REFERENCES perfis(id),
    CONSTRAINT fk_conversas_destinatario FOREIGN KEY (perfil_destinatario_id) REFERENCES perfis(id),
    CONSTRAINT fk_conversas_criado_por FOREIGN KEY (criado_por) REFERENCES dados_pessoais(id),
    CONSTRAINT fk_conversas_atualizado_por FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);

CREATE TABLE conversas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    remetente_dados_pessoais_id BIGINT,
    remetente_perfil_id BIGINT,
    perfil_destinatario_id BIGINT,
    status VARCHAR(20),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_conversas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
