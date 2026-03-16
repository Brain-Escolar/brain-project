CREATE TABLE avaliacoes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(25) NOT NULL,
    disciplina_id BIGINT NOT NULL,
    peso DECIMAL(5,2) NOT NULL,
    conteudo VARCHAR(255),
    nota_extra BOOLEAN DEFAULT FALSE,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_avaliacoes_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    CONSTRAINT fk_avaliacoes_atualizado_por FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);
