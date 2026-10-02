-- O que sustenta a cobranca. Hoje "matricula" e alunos.matriculado (booleano) +
-- processos_matricula (o funil do CRM). Falta o registro do vinculo por ano
-- letivo, e sem ele nao ha o que faturar.
--  * matriculas: aluno x ano letivo, com status e ligacao ao processo do CRM
--  * contratos_servico: o acordo comercial (anuidade, parcelas, vencimento)
--  * contratos_itens: snapshot do produto e do preco no fechamento
--  * titulos: as parcelas (contas a receber), imutaveis

CREATE TABLE matriculas (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    ano_letivo INTEGER NOT NULL,
    unidade_id BIGINT NOT NULL,
    serie_id BIGINT NOT NULL,
    turma_id BIGINT,
    turno VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    processo_matricula_id BIGINT,
    data_efetivacao DATE,
    data_saida DATE,
    motivo_saida VARCHAR(255),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_matriculas_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    CONSTRAINT fk_matriculas_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id),
    CONSTRAINT fk_matriculas_serie FOREIGN KEY (serie_id) REFERENCES series(id),
    CONSTRAINT fk_matriculas_turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
    CONSTRAINT fk_matriculas_processo FOREIGN KEY (processo_matricula_id) REFERENCES processos_matricula(id),
    CONSTRAINT chk_matriculas_status CHECK (status IN
        ('PRE_MATRICULA','EFETIVADA','TRANCADA','TRANSFERIDA','CANCELADA','CONCLUIDA')),
    CONSTRAINT chk_matriculas_efetivacao CHECK (status <> 'EFETIVADA' OR data_efetivacao IS NOT NULL)
);

-- "Uma matricula viva por aluno/ano" nao vira UNIQUE porque matricula cancelada
-- nao pode bloquear nova tentativa, e UNIQUE parcial nao roda no H2 dos testes.
-- A regra fica no servico, antes de efetivar.
CREATE INDEX idx_matriculas_aluno_ano ON matriculas (aluno_id, ano_letivo);
CREATE INDEX idx_matriculas_ano_unidade ON matriculas (ano_letivo, unidade_id, status);
CREATE INDEX idx_matriculas_processo ON matriculas (processo_matricula_id);

-- matriculas.processo_matricula_id: Costura com o CRM: e por aqui que a
--   reserva de orcamento de bolsa feita na proposta ao lead encontra a
--   matricula e vira compromisso, em vez de expirar

CREATE TABLE matriculas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aluno_id BIGINT,
    ano_letivo INTEGER,
    unidade_id BIGINT,
    serie_id BIGINT,
    turma_id BIGINT,
    turno VARCHAR(50),
    status VARCHAR(20),
    processo_matricula_id BIGINT,
    data_efetivacao DATE,
    data_saida DATE,
    motivo_saida VARCHAR(255),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_matriculas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE contratos_servico (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL,
    responsavel_id BIGINT NOT NULL,
    numero VARCHAR(30) NOT NULL UNIQUE,
    qtd_parcelas INTEGER NOT NULL,
    dia_vencimento INTEGER NOT NULL,
    valor_bruto DECIMAL(10,2) NOT NULL,
    valor_desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_liquido DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_contratos_servico_matricula FOREIGN KEY (matricula_id) REFERENCES matriculas(id),
    CONSTRAINT fk_contratos_servico_responsavel FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id),
    CONSTRAINT chk_contratos_servico_status CHECK (status IN ('RASCUNHO','VIGENTE','RESCINDIDO','ENCERRADO')),
    -- Lei 9.870/99: anuidade em parcelas iguais (12 ou 6 na pratica)
    CONSTRAINT chk_contratos_servico_parcelas CHECK (qtd_parcelas BETWEEN 1 AND 12),
    -- ate 28 para o vencimento existir em fevereiro sem regra especial
    CONSTRAINT chk_contratos_servico_dia CHECK (dia_vencimento BETWEEN 1 AND 28),
    CONSTRAINT chk_contratos_servico_valores CHECK (
        valor_bruto >= 0 AND valor_desconto >= 0
        AND valor_desconto <= valor_bruto
        AND valor_liquido = valor_bruto - valor_desconto)
);
CREATE INDEX idx_contratos_servico_matricula ON contratos_servico (matricula_id);
CREATE INDEX idx_contratos_servico_responsavel ON contratos_servico (responsavel_id);

-- contratos_servico.responsavel_id: Pagador principal. Deve ser um
--   responsavel com financeiro = TRUE (validado no servico; o banco nao
--   consegue checar entre tabelas). Rateio entre dois pagadores se resolve em
--   titulos, nao aqui.

CREATE TABLE contratos_servico_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    matricula_id BIGINT,
    responsavel_id BIGINT,
    numero VARCHAR(30),
    qtd_parcelas INTEGER,
    dia_vencimento INTEGER,
    valor_bruto DECIMAL(10,2),
    valor_desconto DECIMAL(10,2),
    valor_liquido DECIMAL(10,2),
    status VARCHAR(20),
    data_inicio DATE,
    data_fim DATE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_contratos_servico_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE contratos_itens (
    id BIGSERIAL PRIMARY KEY,
    contrato_id BIGINT NOT NULL,
    produto_modalidade_id BIGINT NOT NULL,
    produto_preco_id BIGINT,
    descricao VARCHAR(255) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    elegivel_bolsa BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_contratos_itens_contrato FOREIGN KEY (contrato_id) REFERENCES contratos_servico(id),
    CONSTRAINT fk_contratos_itens_modalidade FOREIGN KEY (produto_modalidade_id) REFERENCES produtos_modalidades(id),
    -- SET NULL: o preco de catalogo pode ser limpo sem derrubar o contrato.
    -- descricao e valor_unitario sao snapshot; este FK e so o rastro da origem.
    CONSTRAINT fk_contratos_itens_preco FOREIGN KEY (produto_preco_id)
        REFERENCES produtos_precos(id) ON DELETE SET NULL,
    CONSTRAINT chk_contratos_itens_qtd CHECK (quantidade > 0),
    CONSTRAINT chk_contratos_itens_valor CHECK (valor_unitario >= 0)
);
CREATE INDEX idx_contratos_itens_contrato ON contratos_itens (contrato_id);

-- contratos_itens.descricao: Congelada no fechamento, como valor_unitario
-- contratos_itens.elegivel_bolsa: Resolvido de tipos_bolsa_produtos no
--   fechamento e congelado aqui, para o calculo da renuncia nao mudar se a
--   politica mudar depois

CREATE TABLE contratos_itens_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    contrato_id BIGINT,
    produto_modalidade_id BIGINT,
    produto_preco_id BIGINT,
    descricao VARCHAR(255),
    valor_unitario DECIMAL(10,2),
    quantidade INTEGER,
    elegivel_bolsa BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_contratos_itens_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE titulos (
    id BIGSERIAL PRIMARY KEY,
    contrato_id BIGINT NOT NULL,
    responsavel_id BIGINT NOT NULL,
    competencia DATE NOT NULL,
    numero_parcela INTEGER NOT NULL,
    vencimento DATE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor_bruto DECIMAL(10,2) NOT NULL,
    valor_desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_liquido DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    titulo_origem_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_titulos_contrato FOREIGN KEY (contrato_id) REFERENCES contratos_servico(id),
    CONSTRAINT fk_titulos_responsavel FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id),
    CONSTRAINT fk_titulos_origem FOREIGN KEY (titulo_origem_id) REFERENCES titulos(id),
    CONSTRAINT chk_titulos_status CHECK (status IN
        ('ABERTO','PAGO','CANCELADO','ESTORNADO','RENEGOCIADO')),
    CONSTRAINT chk_titulos_valores CHECK (
        valor_bruto >= 0 AND valor_desconto >= 0
        AND valor_desconto <= valor_bruto
        AND valor_liquido = valor_bruto - valor_desconto),
    CONSTRAINT chk_titulos_competencia CHECK (EXTRACT(DAY FROM competencia) = 1)
);

-- Rateio entre dois responsaveis (pais separados) cabe aqui: duas linhas com a
-- mesma parcela e responsaveis diferentes.
CREATE UNIQUE INDEX uq_titulos_parcela ON titulos (contrato_id, numero_parcela, responsavel_id);
-- Tela de financeiro do responsavel e, depois, o aging da inadimplencia.
CREATE INDEX idx_titulos_portal ON titulos (responsavel_id, status, vencimento);
CREATE INDEX idx_titulos_contrato ON titulos (contrato_id, numero_parcela);

-- titulos: Conta a receber. Imutavel: mudanca de valor se faz estornando e
--   emitindo novo titulo (titulo_origem_id aponta para o estornado), para o
--   relatorio historico nao se desmanchar.
-- titulos.valor_bruto: Guardar bruto e desconto separados e o que permite a
--   tela do responsavel dizer "R$ 1.200, menos 33% de bolsa, da R$ 804" em
--   vez de so o valor final

CREATE TABLE titulos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    contrato_id BIGINT,
    responsavel_id BIGINT,
    competencia DATE,
    numero_parcela INTEGER,
    vencimento DATE,
    descricao VARCHAR(255),
    valor_bruto DECIMAL(10,2),
    valor_desconto DECIMAL(10,2),
    valor_liquido DECIMAL(10,2),
    status VARCHAR(20),
    titulo_origem_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_titulos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
