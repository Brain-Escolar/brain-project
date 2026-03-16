CREATE TABLE dados_pessoais(
    id BIGSERIAL NOT NULL,
    cpf VARCHAR(20) NOT NULL UNIQUE,
    rg VARCHAR(9) UNIQUE,
    matricula VARCHAR(20) UNIQUE,
    nome VARCHAR(255) NOT NULL,
    nome_social VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    email_profissional VARCHAR(100) UNIQUE,
    data_de_nascimento DATE NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    complemento VARCHAR(100),
    numero VARCHAR(20),
    uf VARCHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    genero VARCHAR(100),
    cor_raca VARCHAR(100),
    cidade_naturalidade VARCHAR(100),
    carteira_de_trabalho VARCHAR(20) UNIQUE,
    primary key(id)
);

ALTER TABLE alunos DROP COLUMN cpf;
ALTER TABLE alunos DROP COLUMN rg;
ALTER TABLE alunos DROP COLUMN matricula;
ALTER TABLE alunos DROP COLUMN nome;
ALTER TABLE alunos DROP COLUMN nome_social;
ALTER TABLE alunos DROP COLUMN email;
ALTER TABLE alunos DROP COLUMN email_escolar;
ALTER TABLE alunos DROP COLUMN data_de_nascimento;
ALTER TABLE alunos DROP COLUMN logradouro;
ALTER TABLE alunos DROP COLUMN bairro;
ALTER TABLE alunos DROP COLUMN cep;
ALTER TABLE alunos DROP COLUMN complemento;
ALTER TABLE alunos DROP COLUMN numero;
ALTER TABLE alunos DROP COLUMN uf;
ALTER TABLE alunos DROP COLUMN cidade;
ALTER TABLE alunos DROP COLUMN usuario_id;

ALTER TABLE coordenadores DROP COLUMN cpf;
ALTER TABLE coordenadores DROP COLUMN rg;
ALTER TABLE coordenadores DROP COLUMN nome;
ALTER TABLE coordenadores DROP COLUMN email;
ALTER TABLE coordenadores DROP COLUMN email_profissional;
ALTER TABLE coordenadores DROP COLUMN data_de_nascimento;
ALTER TABLE coordenadores DROP COLUMN logradouro;
ALTER TABLE coordenadores DROP COLUMN bairro;
ALTER TABLE coordenadores DROP COLUMN cep;
ALTER TABLE coordenadores DROP COLUMN complemento;
ALTER TABLE coordenadores DROP COLUMN numero;
ALTER TABLE coordenadores DROP COLUMN uf;
ALTER TABLE coordenadores DROP COLUMN cidade;
ALTER TABLE coordenadores DROP COLUMN carteira_de_trabalho;
ALTER TABLE coordenadores DROP COLUMN usuario_id;

ALTER TABLE diretores DROP COLUMN cpf;
ALTER TABLE diretores DROP COLUMN rg;
ALTER TABLE diretores DROP COLUMN nome;
ALTER TABLE diretores DROP COLUMN email;
ALTER TABLE diretores DROP COLUMN email_profissional;
ALTER TABLE diretores DROP COLUMN data_de_nascimento;
ALTER TABLE diretores DROP COLUMN logradouro;
ALTER TABLE diretores DROP COLUMN bairro;
ALTER TABLE diretores DROP COLUMN cep;
ALTER TABLE diretores DROP COLUMN complemento;
ALTER TABLE diretores DROP COLUMN numero;
ALTER TABLE diretores DROP COLUMN uf;
ALTER TABLE diretores DROP COLUMN cidade;
ALTER TABLE diretores DROP COLUMN carteira_de_trabalho;
ALTER TABLE diretores DROP COLUMN usuario_id;

ALTER TABLE orientadores DROP COLUMN cpf;
ALTER TABLE orientadores DROP COLUMN rg;
ALTER TABLE orientadores DROP COLUMN nome;
ALTER TABLE orientadores DROP COLUMN email;
ALTER TABLE orientadores DROP COLUMN email_profissional;
ALTER TABLE orientadores DROP COLUMN data_de_nascimento;
ALTER TABLE orientadores DROP COLUMN logradouro;
ALTER TABLE orientadores DROP COLUMN bairro;
ALTER TABLE orientadores DROP COLUMN cep;
ALTER TABLE orientadores DROP COLUMN complemento;
ALTER TABLE orientadores DROP COLUMN numero;
ALTER TABLE orientadores DROP COLUMN uf;
ALTER TABLE orientadores DROP COLUMN cidade;
ALTER TABLE orientadores DROP COLUMN carteira_de_trabalho;
ALTER TABLE orientadores DROP COLUMN usuario_id;

ALTER TABLE professores DROP COLUMN cpf;
ALTER TABLE professores DROP COLUMN rg;
ALTER TABLE professores DROP COLUMN matricula;
ALTER TABLE professores DROP COLUMN nome;
ALTER TABLE professores DROP COLUMN nome_social;
ALTER TABLE professores DROP COLUMN email;
ALTER TABLE professores DROP COLUMN email_profissional;
ALTER TABLE professores DROP COLUMN data_de_nascimento;
ALTER TABLE professores DROP COLUMN logradouro;
ALTER TABLE professores DROP COLUMN bairro;
ALTER TABLE professores DROP COLUMN cep;
ALTER TABLE professores DROP COLUMN complemento;
ALTER TABLE professores DROP COLUMN numero;
ALTER TABLE professores DROP COLUMN uf;
ALTER TABLE professores DROP COLUMN cidade;
ALTER TABLE professores DROP COLUMN genero;
ALTER TABLE professores DROP COLUMN cor_raca;
ALTER TABLE professores DROP COLUMN cidade_naturalidade;
ALTER TABLE professores DROP COLUMN carteira_de_trabalho;
ALTER TABLE professores DROP COLUMN usuario_id;

ALTER TABLE responsaveis DROP COLUMN cpf;
ALTER TABLE responsaveis DROP COLUMN rg;
ALTER TABLE responsaveis DROP COLUMN nome;
ALTER TABLE responsaveis DROP COLUMN email;
ALTER TABLE responsaveis DROP COLUMN logradouro;
ALTER TABLE responsaveis DROP COLUMN bairro;
ALTER TABLE responsaveis DROP COLUMN cep;
ALTER TABLE responsaveis DROP COLUMN complemento;
ALTER TABLE responsaveis DROP COLUMN numero;
ALTER TABLE responsaveis DROP COLUMN uf;
ALTER TABLE responsaveis DROP COLUMN cidade;
ALTER TABLE responsaveis DROP COLUMN usuario_id;

ALTER TABLE recursos_humanos DROP COLUMN cpf;
ALTER TABLE recursos_humanos DROP COLUMN rg;
ALTER TABLE recursos_humanos DROP COLUMN nome;
ALTER TABLE recursos_humanos DROP COLUMN email;
ALTER TABLE recursos_humanos DROP COLUMN email_profissional;
ALTER TABLE recursos_humanos DROP COLUMN data_de_nascimento;
ALTER TABLE recursos_humanos DROP COLUMN logradouro;
ALTER TABLE recursos_humanos DROP COLUMN bairro;
ALTER TABLE recursos_humanos DROP COLUMN cep;
ALTER TABLE recursos_humanos DROP COLUMN complemento;
ALTER TABLE recursos_humanos DROP COLUMN numero;
ALTER TABLE recursos_humanos DROP COLUMN uf;
ALTER TABLE recursos_humanos DROP COLUMN cidade;
ALTER TABLE recursos_humanos DROP COLUMN carteira_de_trabalho;
ALTER TABLE recursos_humanos DROP COLUMN usuario_id;

ALTER TABLE secretarios DROP COLUMN cpf;
ALTER TABLE secretarios DROP COLUMN rg;
ALTER TABLE secretarios DROP COLUMN nome;
ALTER TABLE secretarios DROP COLUMN email;
ALTER TABLE secretarios DROP COLUMN email_profissional;
ALTER TABLE secretarios DROP COLUMN data_de_nascimento;
ALTER TABLE secretarios DROP COLUMN logradouro;
ALTER TABLE secretarios DROP COLUMN bairro;
ALTER TABLE secretarios DROP COLUMN cep;
ALTER TABLE secretarios DROP COLUMN complemento;
ALTER TABLE secretarios DROP COLUMN numero;
ALTER TABLE secretarios DROP COLUMN uf;
ALTER TABLE secretarios DROP COLUMN cidade;
ALTER TABLE secretarios DROP COLUMN carteira_de_trabalho;
ALTER TABLE secretarios DROP COLUMN usuario_id;

ALTER TABLE alunos ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE coordenadores ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE diretores ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE orientadores ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE professores ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE responsaveis ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE recursos_humanos ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE secretarios ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE usuarios ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
ALTER TABLE alertas_usuario ADD COLUMN dados_pessoais_id BIGINT REFERENCES dados_pessoais(id);
