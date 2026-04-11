ALTER TABLE avaliacoes DROP COLUMN peso;
ALTER TABLE avaliacoes ADD COLUMN nota_maxima DECIMAL(5,2);

ALTER TABLE avaliacoes_AUD DROP COLUMN peso;
ALTER TABLE avaliacoes_AUD ADD COLUMN nota_maxima DECIMAL(5,2);
