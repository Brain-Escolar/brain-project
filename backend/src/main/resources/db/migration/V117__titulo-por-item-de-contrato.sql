-- O titulo passa a ser por ITEM do contrato, nao por parcela do contrato inteiro.
--
-- Ate aqui, uma familia com mensalidade, seguro e material recebia um titulo por
-- mes com tudo somado. Agora recebe um por item por mes, como faz o sistema que
-- a escola ja usa. Dois motivos concretos, e nenhum deles e estetico:
--
--   1. SERVICO CONTRATADO DEPOIS. Seguro, passeio e material opcional sao
--      contratados no meio do ano. Nao ha como enfia-los num carne ja emitido
--      sem reescrever titulo, e titulo nao se reescreve. Com titulo por item, o
--      servico novo simplesmente emite os seus.
--   2. EMITENTE DIFERENTE. Material didatico costuma ser faturado por outra
--      empresa do grupo. Um titulo que mistura mensalidade e material nao tem
--      como ter um emitente so -- e isso respinga em nota fiscal, em quem e o
--      beneficiario do boleto e na declaracao de valores pagos do IR.
--
-- A bolsa tambem fica mais honesta: ela incide sobre os itens elegiveis, e agora
-- aparece no item onde incidiu, em vez de diluida em todas as parcelas.

ALTER TABLE titulos ADD COLUMN contrato_item_id BIGINT;
ALTER TABLE titulos ADD CONSTRAINT fk_titulos_contrato_item
    FOREIGN KEY (contrato_item_id) REFERENCES contratos_itens(id);

-- Vencimento original ao lado do vigente. Sem isto, adiar uma parcela obrigaria
-- a emitir titulo novo so para trocar uma data -- e o relatorio perderia a
-- informacao de que a parcela de novembro era de novembro.
ALTER TABLE titulos ADD COLUMN vencimento_original DATE;
UPDATE titulos SET vencimento_original = vencimento WHERE vencimento_original IS NULL;

ALTER TABLE titulos_AUD ADD COLUMN contrato_item_id BIGINT;
ALTER TABLE titulos_AUD ADD COLUMN vencimento_original DATE;

-- O indice unico ganha o item. Sem isso, mensalidade e seguro da parcela 3 do
-- mesmo responsavel colidiriam -- e seriam recusados como se fossem o mesmo
-- titulo emitido duas vezes.
--
-- contrato_item_id e nullable e no PostgreSQL NULLs sao distintos entre si,
-- entao as linhas antigas (anteriores a esta migration) nao conflitam. Linha
-- nova sempre tem item: quem garante e MatriculaEfetivacaoService.
DROP INDEX uq_titulos_parcela;
CREATE UNIQUE INDEX uq_titulos_parcela
    ON titulos (contrato_id, contrato_item_id, numero_parcela, responsavel_id, versao);

-- Snapshot da natureza no fechamento, como descricao e valor_unitario ja sao.
-- E ela que decide quantos titulos o item gera: RECORRENTE gera um por
-- competencia, UNICO e EVENTUAL geram um so. Congelada aqui porque, se o
-- produto mudar de natureza no catalogo no ano que vem, o contrato deste ano
-- tem de continuar explicando o carne que emitiu.
ALTER TABLE contratos_itens ADD COLUMN natureza VARCHAR(20);
ALTER TABLE contratos_itens ADD CONSTRAINT chk_contratos_itens_natureza
    CHECK (natureza IS NULL OR natureza IN ('RECORRENTE','UNICO','EVENTUAL'));

-- Quanto da bolsa caiu NESTE item. O contrato continua com o total; isto diz
-- onde ele pousou, que e o que a familia ve e o que a renuncia de receita
-- precisa saber por produto.
ALTER TABLE contratos_itens ADD COLUMN valor_desconto DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE contratos_itens ADD CONSTRAINT chk_contratos_itens_desconto
    CHECK (valor_desconto >= 0 AND valor_desconto <= valor_unitario * quantidade);

ALTER TABLE contratos_itens_AUD ADD COLUMN natureza VARCHAR(20);
ALTER TABLE contratos_itens_AUD ADD COLUMN valor_desconto DECIMAL(10,2);

-- Busca do carne agrupado por produto, que e como a familia passa a ver.
CREATE INDEX idx_titulos_item ON titulos (contrato_item_id, numero_parcela);
