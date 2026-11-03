-- Aprovador na tabela de precos -- a outra metade da entrega da V1
-- ("TabelaPreco e Desconto com vigencia e aprovador"). A vigencia ja existia
-- desde a V100; o aprovador, nao.
--
-- Por que importa: preco e a primeira linha da cadeia. Quem muda o preco muda a
-- receita do ano inteiro, e ate aqui qualquer um com acesso ao catalogo mudava
-- sozinho, sem rastro de quem decidiu. Reajuste nao e cadastro, e decisao.
--
-- O DENTE da regra nao esta aqui, esta no repositorio: buscarVigentes e
-- buscarVigentesDoCatalogo passam a exigir status = 'APROVADO'. Sem isso a
-- aprovacao seria enfeite -- um preco pendente continuaria precificando
-- proposta, e a coluna serviria so para relatorio.
--
-- Esta tabela nao tem gemea _AUD de proposito (ver V100): ela PROPRIA e o
-- historico, porque linha de preco nunca e editada no lugar. As colunas de
-- decisao seguem a mesma logica: ficam na linha que foi decidida.

ALTER TABLE produtos_precos ADD COLUMN status VARCHAR(25);
ALTER TABLE produtos_precos ADD COLUMN solicitado_por BIGINT REFERENCES dados_pessoais (id);
ALTER TABLE produtos_precos ADD COLUMN aprovado_por BIGINT REFERENCES dados_pessoais (id);
ALTER TABLE produtos_precos ADD COLUMN aprovado_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE produtos_precos ADD COLUMN motivo_decisao VARCHAR(255);

-- Backfill OBRIGATORIO, e nao detalhe de migration.
--
-- Os precos que ja existem foram cadastrados num mundo sem aprovacao, e
-- precificam contratos vigentes. Deixa-los NULL faria o filtro de APROVADO
-- descartar todos: no dia do deploy, nenhuma proposta acharia preco e a
-- matricula pararia de funcionar -- sem erro nenhum, so "produto sem preco".
UPDATE produtos_precos SET status = 'APROVADO' WHERE status IS NULL;

ALTER TABLE produtos_precos ALTER COLUMN status SET NOT NULL;
ALTER TABLE produtos_precos ALTER COLUMN status SET DEFAULT 'PENDENTE_APROVACAO';

ALTER TABLE produtos_precos ADD CONSTRAINT chk_produtos_precos_status CHECK (status IN
    ('PENDENTE_APROVACAO','APROVADO','REJEITADO'));

-- Decisao registrada exige quem decidiu. Os backfillados ficam de fora: eles
-- nasceram antes da regra existir, e inventar um aprovador para eles seria
-- gravar uma mentira auditavel.
ALTER TABLE produtos_precos ADD CONSTRAINT chk_produtos_precos_decisao CHECK (
    status <> 'REJEITADO' OR (aprovado_por IS NOT NULL AND aprovado_em IS NOT NULL));

-- A fila de aprovacao: quem aprova abre a tela e ve o que espera por ele.
CREATE INDEX idx_produtos_precos_pendentes ON produtos_precos (status, criado_em);
