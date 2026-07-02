-- Materiais complementares: arquivos e links de apoio que o professor compartilha por disciplina

CREATE TABLE materiais_complementares (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    disciplina_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    tipo VARCHAR(20) NOT NULL,
    url VARCHAR(500),
    arquivo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_materiais_complementares_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    CONSTRAINT fk_materiais_complementares_professor FOREIGN KEY (professor_id) REFERENCES professores(id),
    CONSTRAINT fk_materiais_complementares_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivos(id)
);

CREATE TABLE IF NOT EXISTS materiais_complementares_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    disciplina_id BIGINT,
    professor_id BIGINT,
    titulo VARCHAR(255),
    descricao VARCHAR(255),
    tipo VARCHAR(20),
    url VARCHAR(500),
    arquivo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_materiais_complementares_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
