ALTER TABLE aulas ADD COLUMN horario_inicio TIME;
ALTER TABLE aulas ADD COLUMN horario_fim TIME;

ALTER TABLE aulas DROP COLUMN horario_id;
