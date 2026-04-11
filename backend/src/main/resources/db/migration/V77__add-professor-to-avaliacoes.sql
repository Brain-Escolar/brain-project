ALTER TABLE avaliacoes ADD COLUMN professor_id BIGINT;
ALTER TABLE avaliacoes ADD CONSTRAINT fk_avaliacoes_professor FOREIGN KEY (professor_id) REFERENCES professores(id);

ALTER TABLE avaliacoes_AUD ADD COLUMN professor_id BIGINT;
