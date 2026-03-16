ALTER TABLE fichas_medicas DROP COLUMN aluno_id;
ALTER TABLE fichas_medicas ADD COLUMN dados_pessoais_id BIGINT NOT NULL REFERENCES dados_pessoais(id) ON DELETE CASCADE;
