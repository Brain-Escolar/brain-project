create table dependentes (
    id BIGSERIAL NOT NULL,
    responsavel_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11),
    data_de_nascimento DATE,
    grau_parentesco VARCHAR(30),
    possui_deficiencia BOOLEAN NOT NULL DEFAULT FALSE,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    primary key (id),
    constraint fk_dependente_responsavel foreign key (responsavel_id) references dados_pessoais(id)
);

CREATE TABLE IF NOT EXISTS dependentes_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    responsavel_id BIGINT,
    nome VARCHAR(100),
    cpf VARCHAR(11),
    data_de_nascimento DATE,
    grau_parentesco VARCHAR(30),
    possui_deficiencia BOOLEAN,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_dependentes_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
