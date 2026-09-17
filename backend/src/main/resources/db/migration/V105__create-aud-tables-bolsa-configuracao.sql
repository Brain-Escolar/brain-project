-- Tabelas _AUD que faltaram na V102.
--
-- As entidades de configuracao da bolsa sao @Audited e o perfil de teste roda
-- com ddl-auto=validate, entao o Hibernate cobra a gemea de cada uma no boot --
-- foi o que derrubou o contextLoads.
--
-- E sao auditadas de proposito: quem mexeu na matriz de descontos e na alcada,
-- e quando, e a regra que governa quanto dinheiro a escola deixa de arrecadar.
-- Isso e exatamente o que se quer poder reconstruir depois.
--
-- produtos_precos continua FORA da auditoria (ver comentario na V100): a tabela
-- ja e temporal e o delete vem por cascade, que nao passa pelo Hibernate.

CREATE TABLE politicas_bolsa_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    ano_letivo INTEGER,
    exige_cebas BOOLEAN,
    observacao TEXT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_politicas_bolsa_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE tipos_bolsa_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    codigo VARCHAR(30),
    nome VARCHAR(100),
    estrutural BOOLEAN,
    exige_comprovacao BOOLEAN,
    conta_para_cebas BOOLEAN,
    acumula_com_outras BOOLEAN,
    ativo BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_tipos_bolsa_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE matrizes_desconto_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    politica_id BIGINT,
    tipo_bolsa_id BIGINT,
    unidade_id BIGINT,
    serie_id BIGINT,
    percentual_max DECIMAL(5,2),
    vigencia_inicio DATE,
    vigencia_fim DATE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_matrizes_desconto_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE alcadas_desconto_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    politica_id BIGINT,
    perfil_id BIGINT,
    percentual_max DECIMAL(5,2),
    pode_exceder_envelope BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_alcadas_desconto_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
