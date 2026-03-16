ALTER TABLE chamadas ADD COLUMN disciplina_id BIGINT;
ALTER TABLE chamadas ADD CONSTRAINT fk_chamadas_disciplinas FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id);
