ALTER TABLE comunicados ADD COLUMN categoria VARCHAR(30);
ALTER TABLE comunicados ADD COLUMN imagem_url VARCHAR(500);
ALTER TABLE comunicados ADD COLUMN anexo_url VARCHAR(500);

ALTER TABLE comunicados_AUD ADD COLUMN categoria VARCHAR(30);
ALTER TABLE comunicados_AUD ADD COLUMN imagem_url VARCHAR(500);
ALTER TABLE comunicados_AUD ADD COLUMN anexo_url VARCHAR(500);
