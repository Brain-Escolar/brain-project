CREATE TABLE unidades (
    id BIGSERIAL NOT NULL,
    nome VARCHAR(255) NOT NULL,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id),
    primary key(id)
);

CREATE TABLE series (
    id BIGSERIAL NOT NULL,
    nome VARCHAR(255) NOT NULL,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id),
    primary key(id)
);

CREATE TABLE turmas (
    id BIGSERIAL NOT NULL,
    nome VARCHAR(255) NOT NULL,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id),
    primary key(id)
);
