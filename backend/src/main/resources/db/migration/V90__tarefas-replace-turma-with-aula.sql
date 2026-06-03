-- Adiciona coluna aula_id em tarefas
ALTER TABLE tarefas ADD COLUMN aula_id BIGINT;
ALTER TABLE tarefas ADD CONSTRAINT fk_tarefas_aula FOREIGN KEY (aula_id) REFERENCES aulas(id);

-- Remove coluna turma_id de tarefas
ALTER TABLE tarefas DROP CONSTRAINT IF EXISTS tarefas_turma_id_fkey;
ALTER TABLE tarefas DROP COLUMN IF EXISTS turma_id;

-- Mesmas alterações na tabela de auditoria
ALTER TABLE tarefas_AUD ADD COLUMN aula_id BIGINT;
ALTER TABLE tarefas_AUD DROP COLUMN IF EXISTS turma_id;
