ALTER TABLE tarefas ADD COLUMN turma_id BIGINT NOT NULL;
ALTER TABLE tarefas ADD CONSTRAINT fk_tarefas_turma FOREIGN KEY (turma_id) REFERENCES turmas(id);

ALTER TABLE tarefas_AUD ADD COLUMN turma_id BIGINT;
