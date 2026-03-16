CREATE TABLE conteudos (
    id BIGSERIAL NOT NULL,
    aula_id BIGINT NOT NULL,
    conteudo VARCHAR(255) NOT NULL,
    data_conteudo DATE NOT NULL,
    CONSTRAINT fk_conteudos_aula
        FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);
