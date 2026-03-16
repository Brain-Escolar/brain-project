ALTER TABLE anotacoes
    DROP COLUMN disciplina_id;

ALTER TABLE anotacoes
    ADD COLUMN aula_id BIGINT NOT NULL REFERENCES aulas(id);
