ALTER TABLE disciplinas
    DROP COLUMN IF EXISTS unidade_id;
ALTER TABLE disciplinas
    DROP CONSTRAINT IF EXISTS fk_disciplina_unidade;
ALTER TABLE disciplinas
    DROP COLUMN IF EXISTS carga_horaria;
ALTER TABLE disciplinas
    ADD COLUMN carga_horaria INTEGER;
