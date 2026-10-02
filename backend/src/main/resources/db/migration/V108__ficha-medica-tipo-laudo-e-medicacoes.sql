-- Ficha médica: laudos passam a ser classificados por tipo e comentados, e a
-- medicação em uso (tabela criada na V99 para o portal do responsável) ganha o
-- que a Orientação registra: receita anexada e período de administração. É a
-- mesma tabela de propósito — o que a família declara e o que a escola
-- complementa são o mesmo registro. As alergias continuam nas colunas já
-- existentes de fichas_medicas (alergias_alimentares / alergias_medicamentosas).
--
-- Um ADD COLUMN por ALTER TABLE: o H2 dos testes não aceita a forma com vírgula.

ALTER TABLE laudos_medicos ADD COLUMN IF NOT EXISTS tipo VARCHAR(30);
ALTER TABLE laudos_medicos ADD COLUMN IF NOT EXISTS observacao TEXT;

ALTER TABLE laudos_medicos_AUD ADD COLUMN IF NOT EXISTS tipo VARCHAR(30);
ALTER TABLE laudos_medicos_AUD ADD COLUMN IF NOT EXISTS observacao TEXT;

-- Laudos já existentes não têm classificação; OUTRO é o valor neutro do enum.
UPDATE laudos_medicos SET tipo = 'OUTRO' WHERE tipo IS NULL;

-- tipo_uso fica nulo no que vem do portal: a família informa nome, dosagem e
-- horário, e classificar o uso (contínuo ou por período) é da escola.
ALTER TABLE medicacoes ADD COLUMN IF NOT EXISTS arquivo_id BIGINT;
ALTER TABLE medicacoes ADD COLUMN IF NOT EXISTS tipo_uso VARCHAR(20);
ALTER TABLE medicacoes ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE medicacoes ADD COLUMN IF NOT EXISTS data_fim DATE;

ALTER TABLE medicacoes
    ADD CONSTRAINT fk_medicacoes_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivos(id);

ALTER TABLE medicacoes_AUD ADD COLUMN IF NOT EXISTS arquivo_id BIGINT;
ALTER TABLE medicacoes_AUD ADD COLUMN IF NOT EXISTS tipo_uso VARCHAR(20);
ALTER TABLE medicacoes_AUD ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE medicacoes_AUD ADD COLUMN IF NOT EXISTS data_fim DATE;
