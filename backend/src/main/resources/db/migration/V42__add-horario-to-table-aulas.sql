ALTER TABLE aulas
DROP COLUMN horario_inicio;

ALTER TABLE aulas
DROP COLUMN horario_fim;

ALTER TABLE aulas
ADD COLUMN horario_id BIGINT;

ALTER TABLE aulas
ADD FOREIGN KEY (horario_id) REFERENCES horarios(id);
