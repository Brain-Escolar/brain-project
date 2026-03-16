CREATE TABLE tarefas (
    id BIGSERIAL NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    conteudo VARCHAR(255),
    documento_url VARCHAR(255),
    professor_id BIGINT NOT NULL,
    data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
    prazo DATE,
    CONSTRAINT fk_tarefas_professor
        FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE
);
