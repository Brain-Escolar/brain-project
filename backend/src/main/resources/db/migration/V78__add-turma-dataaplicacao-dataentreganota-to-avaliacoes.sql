ALTER TABLE avaliacoes ADD COLUMN turma_id BIGINT;
ALTER TABLE avaliacoes ADD COLUMN data_aplicacao DATE;
ALTER TABLE avaliacoes ADD COLUMN data_entrega_notas DATE;
ALTER TABLE avaliacoes ADD COLUMN evento_id BIGINT;
ALTER TABLE avaliacoes ADD CONSTRAINT fk_avaliacoes_turma FOREIGN KEY (turma_id) REFERENCES turmas(id);
ALTER TABLE avaliacoes ADD CONSTRAINT fk_avaliacoes_evento FOREIGN KEY (evento_id) REFERENCES eventos(id);

ALTER TABLE avaliacoes_AUD ADD COLUMN turma_id BIGINT;
ALTER TABLE avaliacoes_AUD ADD COLUMN data_aplicacao DATE;
ALTER TABLE avaliacoes_AUD ADD COLUMN data_entrega_notas DATE;
ALTER TABLE avaliacoes_AUD ADD COLUMN evento_id BIGINT;
