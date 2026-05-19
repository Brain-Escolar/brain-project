CREATE TABLE mensagens (
    id BIGSERIAL PRIMARY KEY,
    conversa_id BIGINT NOT NULL,
    remetente_dados_pessoais_id BIGINT NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_por BIGINT,
    CONSTRAINT fk_mensagens_conversa FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensagens_remetente FOREIGN KEY (remetente_dados_pessoais_id) REFERENCES dados_pessoais(id),
    CONSTRAINT fk_mensagens_criado_por FOREIGN KEY (criado_por) REFERENCES dados_pessoais(id),
    CONSTRAINT fk_mensagens_atualizado_por FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);

CREATE TABLE mensagens_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    conversa_id BIGINT,
    remetente_dados_pessoais_id BIGINT,
    conteudo TEXT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_mensagens_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
