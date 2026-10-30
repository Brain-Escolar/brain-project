-- A baixa: o registro de que a parcela entrou.
--
-- Fica em tabela PROPRIA, e nao como colunas em titulos, por tres motivos que
-- custam caro depois:
--   1. titulo e imutavel por desenho (ver V101). Escrever data e valor pagos na
--      propria linha faria dele um registro mutavel pela porta de servico.
--   2. a baixa precisa de autor e de estorno com motivo. Em colunas de titulos
--      isso vira meia duzia de campos quase sempre nulos.
--   3. na V2 entra a cobranca (boleto/Pix) e a baixa passa a vir de webhook. O
--      pagamento ja sendo entidade separada, muda a origem e nao o modelo.
--
-- O estorno NAO apaga a linha: marca estornado_em/por/motivo. Quem conferiu o
-- caixa de ontem tem de continuar vendo que houve uma baixa e que ela foi
-- desfeita -- o extrato do banco tambem continua mostrando.

CREATE TABLE pagamentos (
    id BIGSERIAL PRIMARY KEY,
    titulo_id BIGINT NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_pagamento DATE NOT NULL,
    forma VARCHAR(30) NOT NULL,
    -- Quem deu a baixa. Explicito, e nao apenas criado_por: criado_por e
    -- nullable e preenchido por listener, entao uma importacao ou um job o
    -- deixaria vazio. Numa baixa manual o operador e parte do fato.
    registrado_por_id BIGINT NOT NULL,
    observacao VARCHAR(255),
    estornado_em TIMESTAMPTZ,
    estornado_por_id BIGINT,
    motivo_estorno VARCHAR(255),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_pagamentos_titulo FOREIGN KEY (titulo_id) REFERENCES titulos(id),
    CONSTRAINT fk_pagamentos_registrado_por FOREIGN KEY (registrado_por_id)
        REFERENCES dados_pessoais(id),
    CONSTRAINT fk_pagamentos_estornado_por FOREIGN KEY (estornado_por_id)
        REFERENCES dados_pessoais(id),
    CONSTRAINT chk_pagamentos_valor CHECK (valor_pago > 0),
    CONSTRAINT chk_pagamentos_forma CHECK (forma IN
        ('DINHEIRO','PIX','TRANSFERENCIA','CARTAO_CREDITO','CARTAO_DEBITO',
         'BOLETO','CHEQUE','OUTRO')),
    -- Estorno e tudo ou nada. Sem isto, um estorno gravado pela metade (data sem
    -- autor, ou autor sem motivo) passa, e o relatorio nao sabe mais dizer se o
    -- dinheiro entrou.
    CONSTRAINT chk_pagamentos_estorno CHECK (
        (estornado_em IS NULL AND estornado_por_id IS NULL AND motivo_estorno IS NULL)
        OR (estornado_em IS NOT NULL AND estornado_por_id IS NOT NULL
            AND motivo_estorno IS NOT NULL))
);

-- "Um pagamento vivo por titulo" nao vira UNIQUE parcial (WHERE estornado_em IS
-- NULL) porque indice parcial nao roda no H2 dos testes -- mesma razao da V101.
-- A trava real e outra e mais forte: a baixa exige titulo ABERTO e trava a linha
-- do titulo com SELECT ... FOR UPDATE, entao duas secretarias clicando juntas
-- serializam e a segunda recebe erro de status.
CREATE INDEX idx_pagamentos_titulo ON pagamentos (titulo_id);
-- Caixa do dia e conferencia: "o que entrou em 20/02".
CREATE INDEX idx_pagamentos_data ON pagamentos (data_pagamento, estornado_em);

-- pagamentos.valor_pago: Pode ser MAIOR que o liquido do titulo (juros, multa).
--   Menor nao: baixa parcial nao existe na V1, e aceitar silenciosamente
--   deixaria um saldo que nenhum relatorio cobra. Quem recebeu menos renegocia.
-- pagamentos.data_pagamento: Data em que o dinheiro entrou, nao a do registro.
--   A secretaria lanca na segunda o Pix que caiu no sabado, e a competencia do
--   caixa e sabado.

CREATE TABLE pagamentos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    titulo_id BIGINT,
    valor_pago DECIMAL(10,2),
    data_pagamento DATE,
    forma VARCHAR(30),
    registrado_por_id BIGINT,
    observacao VARCHAR(255),
    estornado_em TIMESTAMPTZ,
    estornado_por_id BIGINT,
    motivo_estorno VARCHAR(255),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_pagamentos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
