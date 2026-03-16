ALTER TABLE chamadas DROP CONSTRAINT IF EXISTS fk_chamadas_disciplinas;
ALTER TABLE chamadas DROP COLUMN IF EXISTS disciplina_id;
