-- Contracheque e declarações do professor:
--  * holerites: contracheque mensal (1 arquivo por professor/ano/mês)
--  * informes_rendimento: informe de rendimentos anual para IR (1 arquivo por professor/ano)

CREATE TABLE holerites (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    arquivo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_holerites_professor FOREIGN KEY (professor_id) REFERENCES professores(id),
    CONSTRAINT fk_holerites_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivos(id),
    CONSTRAINT uq_holerites_professor_ano_mes UNIQUE (professor_id, ano, mes)
);

CREATE TABLE informes_rendimento (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    professor_id BIGINT NOT NULL,
    ano INTEGER NOT NULL,
    meses_considerados INTEGER,
    completo BOOLEAN NOT NULL DEFAULT TRUE,
    arquivo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_informes_rendimento_professor FOREIGN KEY (professor_id) REFERENCES professores(id),
    CONSTRAINT fk_informes_rendimento_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivos(id),
    CONSTRAINT uq_informes_rendimento_professor_ano UNIQUE (professor_id, ano)
);

CREATE TABLE IF NOT EXISTS holerites_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    professor_id BIGINT,
    ano INTEGER,
    mes INTEGER,
    arquivo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_holerites_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS informes_rendimento_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    professor_id BIGINT,
    ano INTEGER,
    meses_considerados INTEGER,
    completo BOOLEAN,
    arquivo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_informes_rendimento_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
