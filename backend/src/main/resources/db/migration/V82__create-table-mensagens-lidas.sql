CREATE TABLE mensagens_lidas (
    mensagem_id BIGINT NOT NULL,
    dados_pessoais_id BIGINT NOT NULL,
    lida_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (mensagem_id, dados_pessoais_id),
    CONSTRAINT fk_mensagens_lidas_mensagem FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensagens_lidas_dados_pessoais FOREIGN KEY (dados_pessoais_id) REFERENCES dados_pessoais(id)
);

CREATE TABLE mensagens_lidas_AUD (
    mensagem_id BIGINT NOT NULL,
    dados_pessoais_id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    lida_em TIMESTAMPTZ,
    PRIMARY KEY (mensagem_id, dados_pessoais_id, rev),
    CONSTRAINT fk_mensagens_lidas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
