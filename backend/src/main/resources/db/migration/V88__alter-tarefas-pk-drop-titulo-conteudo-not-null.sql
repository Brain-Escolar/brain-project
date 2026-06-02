-- Adiciona PRIMARY KEY na coluna id de tarefas
ALTER TABLE tarefas ADD CONSTRAINT tarefas_pkey PRIMARY KEY (id);

-- Remove coluna titulo de tarefas
ALTER TABLE tarefas DROP COLUMN IF EXISTS titulo;

-- Garante que conteudo existente nulo vire string vazia antes de tornar NOT NULL
UPDATE tarefas SET conteudo = '' WHERE conteudo IS NULL;
ALTER TABLE tarefas ALTER COLUMN conteudo SET NOT NULL;

-- Mesmas alteracoes na tabela de auditoria
ALTER TABLE tarefas_AUD DROP COLUMN IF EXISTS titulo;
