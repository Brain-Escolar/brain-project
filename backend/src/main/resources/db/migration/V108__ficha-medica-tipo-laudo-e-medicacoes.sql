-- Ficha médica: laudos passam a ser classificados por tipo e comentados, e as
-- medicações recebem os campos de período e receita usados pela Orientação.

ALTER TABLE laudos_medicos ADD COLUMN IF NOT EXISTS tipo VARCHAR(30);
ALTER TABLE laudos_medicos ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE laudos_medicos_AUD ADD COLUMN IF NOT EXISTS tipo VARCHAR(30);
ALTER TABLE laudos_medicos_AUD ADD COLUMN IF NOT EXISTS observacao TEXT;

-- Laudos já existentes não têm classificação; OUTRO é o valor neutro do enum.
UPDATE laudos_medicos SET tipo = 'OUTRO' WHERE tipo IS NULL;

ALTER TABLE medicacoes ADD COLUMN arquivo_id BIGINT;
ALTER TABLE medicacoes ADD COLUMN tipo_uso VARCHAR(20);
ALTER TABLE medicacoes ADD COLUMN data_inicio DATE;
ALTER TABLE medicacoes ADD COLUMN data_fim DATE;
ALTER TABLE medicacoes ADD COLUMN medicamentos TEXT;

ALTER TABLE medicacoes
    ADD CONSTRAINT fk_medicacoes_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivos(id);

CREATE INDEX idx_medicacoes_arquivo ON medicacoes (arquivo_id);

ALTER TABLE medicacoes_AUD ADD COLUMN arquivo_id BIGINT;
ALTER TABLE medicacoes_AUD ADD COLUMN tipo_uso VARCHAR(20);
ALTER TABLE medicacoes_AUD ADD COLUMN data_inicio DATE;
ALTER TABLE medicacoes_AUD ADD COLUMN data_fim DATE;
ALTER TABLE medicacoes_AUD ADD COLUMN medicamentos TEXT;
