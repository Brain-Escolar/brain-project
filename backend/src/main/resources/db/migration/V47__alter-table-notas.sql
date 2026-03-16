DROP TABLE IF EXISTS notas;

CREATE TABLE notas (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    avaliacao_id BIGINT NOT NULL,
    pontuacao DECIMAL(5,2) NOT NULL,
    periodo_referencia DATE,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id),
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);

