-- Preserva histórico de desmatrícula (motivo e data) em vez de apagar matrícula/e-mail
ALTER TABLE alunos ADD COLUMN motivo_desmatricula VARCHAR(255);
ALTER TABLE alunos ADD COLUMN data_desmatricula DATE;

-- Mesmas alterações na tabela de auditoria
ALTER TABLE alunos_AUD ADD COLUMN motivo_desmatricula VARCHAR(255);
ALTER TABLE alunos_AUD ADD COLUMN data_desmatricula DATE;
