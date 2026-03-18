-- Tabelas _AUD do Envers para entidades criadas após V66

CREATE TABLE IF NOT EXISTS escolaridades_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    descricao VARCHAR(50),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_escolaridades_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS grades_curriculares_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(50),
    versao VARCHAR(20),
    ativo BOOLEAN,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_grades_curriculares_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS disciplinas_grades_AUD (
    disciplina_id BIGINT NOT NULL,
    grade_curricular_id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    carga_horaria INTEGER,
    obrigatoria BOOLEAN,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (disciplina_id, grade_curricular_id, rev),
    CONSTRAINT fk_disciplinas_grades_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
