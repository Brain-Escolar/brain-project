create table anotacoes(
    id BIGSERIAL NOT NULL,
    aluno_id BIGINT NOT NULL REFERENCES alunos(id),
    disciplina_id BIGINT NOT NULL REFERENCES disciplinas(id),
    anotacao BIGINT NOT NULL,
    data_anotacao DATE NOT NULL,
    observacao VARCHAR(255),
    primary key(id)
);
