create table professores(
    id BIGSERIAL NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(9) NOT NULL UNIQUE,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    nome_social VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    email_profissional VARCHAR(100) NOT NULL UNIQUE,
    data_de_nascimento DATE NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    complemento VARCHAR(100),
    numero VARCHAR(20),
    uf VARCHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    genero VARCHAR(100) NOT NULL,
    cor_raca VARCHAR(100) NOT NULL,
    cidade_naturalidade VARCHAR(100) NOT NULL,
    carteira_de_trabalho VARCHAR(20) NOT NULL UNIQUE,

    primary key(id)

);
