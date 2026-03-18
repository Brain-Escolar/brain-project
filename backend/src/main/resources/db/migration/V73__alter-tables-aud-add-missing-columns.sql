ALTER TABLE professores_AUD ADD COLUMN titulo_eleitor VARCHAR(12);
ALTER TABLE professores_AUD ADD COLUMN grupo_disciplina_id BIGINT;
ALTER TABLE professores_AUD ADD COLUMN pis_pasep VARCHAR(11);
ALTER TABLE professores_AUD ADD COLUMN reservista VARCHAR(20);
ALTER TABLE professores_AUD ADD COLUMN codigo_banco VARCHAR(10);
ALTER TABLE professores_AUD ADD COLUMN agencia VARCHAR(10);
ALTER TABLE professores_AUD ADD COLUMN conta VARCHAR(20);
ALTER TABLE professores_AUD ADD COLUMN escolaridade_id BIGINT;
ALTER TABLE professores_AUD ADD COLUMN exame_admissional BOOLEAN;
ALTER TABLE professores_AUD ADD COLUMN consentimento_lgpd BOOLEAN;

ALTER TABLE aulas_AUD DROP COLUMN sala;
ALTER TABLE turmas_AUD ADD COLUMN sala VARCHAR(20);
