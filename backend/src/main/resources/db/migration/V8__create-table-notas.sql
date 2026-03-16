create table notas(
    aluno_id BIGINT NOT NULL REFERENCES alunos(id),
    disciplina_id BIGINT NOT NULL REFERENCES disciplinas(id),
    avaliacao BIGINT NOT NULL,
    pontuacao FLOAT NOT NULL,
    primary key(aluno_id, disciplina_id, avaliacao)
);
