CREATE TABLE IF NOT EXISTS public.escolas (
    id         BIGSERIAL    NOT NULL PRIMARY KEY,
    nome       VARCHAR(255) NOT NULL,
    cnpj       VARCHAR(18)  NOT NULL UNIQUE,
    codigo     VARCHAR(50)  NOT NULL UNIQUE,
    schema_name VARCHAR(70) NOT NULL UNIQUE,
    ativa      BOOLEAN      NOT NULL DEFAULT TRUE,
    criada_em  TIMESTAMP    NOT NULL DEFAULT NOW()
);
