create table responsaveis(
    id BIGSERIAL NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(9) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    logradouro VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    complemento VARCHAR(100),
    numero VARCHAR(20),
    uf VARCHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,

    primary key(id)

);

CREATE TABLE alunos_responsaveis(
    aluno_id BIGINT NOT NULL,
    responsavel_id BIGINT NOT NULL,

    PRIMARY KEY(aluno_id, responsavel_id),
    CONSTRAINT ALUNOS_RESPONSAVEIS_FK_ALUNO FOREIGN KEY(aluno_id) REFERENCES alunos(id),
    CONSTRAINT ALUNOS_RESPONSAVEIS_FK_RESPONSAVEL FOREIGN KEY(responsavel_id) REFERENCES responsaveis(id)

);
