-- Aprovacao de bolsa acima da alcada.
--
-- Ate aqui, pedir mais do que a alcada permite dava ERRO -- e a mensagem do erro
-- prometia uma coisa que nao existia: "encaminhe para aprovacao da direcao".
-- Nao havia para onde encaminhar. O funcionario de balcao ficava com a familia
-- na frente, sabendo que alguem poderia aprovar, e sem como pedir.
--
-- Agora o pedido acima da alcada nasce PENDENTE_APROVACAO. A matriz continua
-- sendo limite duro: ela e a regra da escola, e ninguem a excede, nem a direcao.
-- A alcada e so quem pode decidir -- e isso escala.
--
-- PENDENTE_APROVACAO NAO segura orcamento, de proposito. Se segurasse, pedido
-- esquecido prenderia dinheiro ate expirar, e a escola nao saberia se o
-- envelope esta cheio ou so mal pedido. Em troca, o teto e recalculado na
-- aprovacao, contra o envelope daquele momento -- que e o numero verdadeiro.

ALTER TABLE concessoes_bolsa DROP CONSTRAINT chk_concessoes_bolsa_status;
ALTER TABLE concessoes_bolsa ADD CONSTRAINT chk_concessoes_bolsa_status CHECK (status IN
    ('SIMULADA','PENDENTE_APROVACAO','RESERVADA','ATIVA','ENCERRADA','CANCELADA','REJEITADA'));

-- O que foi PEDIDO, ao lado do que vale.
--
-- Os dois numeros juntos sao a historia da negociacao: "pediu 30, saiu 25" diz
-- muito mais do que "25", e e o que a direcao olha para calibrar a matriz no ano
-- seguinte. Guardar so o aprovado apagaria metade do fato.
ALTER TABLE concessoes_bolsa ADD COLUMN percentual_pedido DECIMAL(5,2);
UPDATE concessoes_bolsa SET percentual_pedido = percentual WHERE percentual_pedido IS NULL;

-- Por que aprovou, aprovou menos, ou recusou. Em seis meses e a unica resposta
-- para "por que esse aluno tem 25 e aquele tem 30".
ALTER TABLE concessoes_bolsa ADD COLUMN motivo_decisao VARCHAR(255);

ALTER TABLE concessoes_bolsa_AUD ADD COLUMN percentual_pedido DECIMAL(5,2);
ALTER TABLE concessoes_bolsa_AUD ADD COLUMN motivo_decisao VARCHAR(255);

-- Decisao registrada exige quem decidiu: aprovado ou rejeitado sem aprovador e
-- um registro que ninguem consegue auditar depois.
ALTER TABLE concessoes_bolsa ADD CONSTRAINT chk_concessoes_bolsa_decisao CHECK (
    status NOT IN ('REJEITADA') OR (aprovado_por IS NOT NULL AND aprovado_em IS NOT NULL));

-- A fila de aprovacao: a direcao abre a tela e ve o que esta esperando por ela.
CREATE INDEX idx_concessoes_bolsa_pendentes
    ON concessoes_bolsa (status, criado_em);
