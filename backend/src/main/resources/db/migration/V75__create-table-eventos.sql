CREATE TABLE eventos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    data_evento DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    turma_id BIGINT,
    serie_id BIGINT,
    unidade_id BIGINT,
    professor_id BIGINT,
    avaliacao_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_eventos_turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
    CONSTRAINT fk_eventos_serie FOREIGN KEY (serie_id) REFERENCES series(id),
    CONSTRAINT fk_eventos_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id),
    CONSTRAINT fk_eventos_professor FOREIGN KEY (professor_id) REFERENCES professores(id),
    CONSTRAINT fk_eventos_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id)
);

CREATE TABLE eventos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    titulo VARCHAR(255),
    descricao VARCHAR(255),
    data_evento DATE,
    tipo VARCHAR(50),
    turma_id BIGINT,
    serie_id BIGINT,
    unidade_id BIGINT,
    professor_id BIGINT,
    avaliacao_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_eventos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

