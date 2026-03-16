CREATE TABLE alunos(
    id BIGSERIAL NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(9),
    matricula VARCHAR(20) UNIQUE,
    matriculado BOOLEAN DEFAULT false NOT NULL,
    unidade_id BIGINT,
    serie_id BIGINT,
    turma_id BIGINT,
    nome VARCHAR(100) NOT NULL,
    nome_social VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    email_escolar VARCHAR(100) UNIQUE,
    data_de_nascimento DATE NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    complemento VARCHAR(100),
    numero VARCHAR(20),
    uf VARCHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,

    PRIMARY KEY(id)

);
