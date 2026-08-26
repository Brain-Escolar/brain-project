-- Produtos da escola (ex.: material, uniforme, curso extra):
--  * produtos: catálogo (nome, descrição)
--  * produtos_modalidades: variante vendável de um produto (ex.: "Tamanho M"), com preço
--  * alunos_produtos: compra de um aluno de uma modalidade, com desconto e valor efetivamente
--    pago (snapshot no momento da compra, independente de alteração futura do preço de catálogo)

CREATE TABLE produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT
);

CREATE TABLE produtos_modalidades (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL,
    modalidade VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_produtos_modalidades_produto FOREIGN KEY (produto_id) REFERENCES produtos(id),
    CONSTRAINT uq_produtos_modalidades_produto_modalidade UNIQUE (produto_id, modalidade)
);

CREATE TABLE alunos_produtos (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    produto_modalidade_id BIGINT NOT NULL,
    desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_compra DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_alunos_produtos_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    CONSTRAINT fk_alunos_produtos_produto_modalidade FOREIGN KEY (produto_modalidade_id) REFERENCES produtos_modalidades(id)
);

CREATE TABLE produtos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(255),
    descricao VARCHAR(255),
    ativo BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_produtos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE produtos_modalidades_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    produto_id BIGINT,
    modalidade VARCHAR(100),
    valor DECIMAL(10,2),
    ativo BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_produtos_modalidades_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE alunos_produtos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aluno_id BIGINT,
    produto_modalidade_id BIGINT,
    desconto DECIMAL(10,2),
    valor_pago DECIMAL(10,2),
    data_compra DATE,
    status VARCHAR(20),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_alunos_produtos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
