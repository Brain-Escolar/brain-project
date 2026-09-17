-- Um calculo so, quatro consumidores: proposta ao lead no CRM, carne simulado,
-- titulos reais e tela de financeiro do responsavel. Se virarem quatro
-- implementacoes, divergem em tres meses.
--
-- A simulacao e criada no estagio "Proposta" do funil (funil_estagios). Enquanto
-- RESERVADA ela segura orcamento no envelope; a efetivacao da matricula
-- MATERIALIZA a simulacao em contrato + titulos, sem recalcular.

CREATE TABLE simulacoes_financeiras (
    id BIGSERIAL PRIMARY KEY,
    processo_matricula_id BIGINT,
    aluno_id BIGINT,
    responsavel_id BIGINT,
    ano_letivo INTEGER NOT NULL,
    unidade_id BIGINT NOT NULL,
    serie_id BIGINT NOT NULL,
    turno VARCHAR(50),
    qtd_parcelas INTEGER NOT NULL,
    dia_vencimento INTEGER NOT NULL,
    valor_bruto DECIMAL(10,2) NOT NULL,
    valor_desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_liquido DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reserva_expira_em TIMESTAMPTZ,
    contrato_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_simulacoes_processo FOREIGN KEY (processo_matricula_id) REFERENCES processos_matricula(id),
    CONSTRAINT fk_simulacoes_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    CONSTRAINT fk_simulacoes_responsavel FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id),
    CONSTRAINT fk_simulacoes_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id),
    CONSTRAINT fk_simulacoes_serie FOREIGN KEY (serie_id) REFERENCES series(id),
    CONSTRAINT fk_simulacoes_contrato FOREIGN KEY (contrato_id) REFERENCES contratos_servico(id),
    CONSTRAINT chk_simulacoes_status CHECK (status IN
        ('RASCUNHO','RESERVADA','CONVERTIDA','EXPIRADA','PERDIDA')),
    CONSTRAINT chk_simulacoes_origem CHECK (processo_matricula_id IS NOT NULL OR aluno_id IS NOT NULL),
    CONSTRAINT chk_simulacoes_valores CHECK (valor_liquido = valor_bruto - valor_desconto),
    CONSTRAINT chk_simulacoes_parcelas CHECK (qtd_parcelas BETWEEN 1 AND 12),
    CONSTRAINT chk_simulacoes_dia CHECK (dia_vencimento BETWEEN 1 AND 28),
    -- reserva so existe enquanto a simulacao a sustenta
    CONSTRAINT chk_simulacoes_reserva CHECK (status <> 'RESERVADA' OR reserva_expira_em IS NOT NULL),
    CONSTRAINT chk_simulacoes_conversao CHECK (status <> 'CONVERTIDA' OR contrato_id IS NOT NULL)
);
CREATE INDEX idx_simulacoes_processo ON simulacoes_financeiras (processo_matricula_id);
CREATE INDEX idx_simulacoes_status ON simulacoes_financeiras (status, reserva_expira_em);

-- simulacoes_financeiras.reserva_expira_em: O job de expiracao libera o que
--   vencer. Sem isso, lead morto come o orcamento de bolsa ate dezembro.

CREATE TABLE simulacoes_financeiras_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    processo_matricula_id BIGINT,
    aluno_id BIGINT,
    responsavel_id BIGINT,
    ano_letivo INTEGER,
    unidade_id BIGINT,
    serie_id BIGINT,
    turno VARCHAR(50),
    qtd_parcelas INTEGER,
    dia_vencimento INTEGER,
    valor_bruto DECIMAL(10,2),
    valor_desconto DECIMAL(10,2),
    valor_liquido DECIMAL(10,2),
    status VARCHAR(20),
    reserva_expira_em TIMESTAMPTZ,
    contrato_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_simulacoes_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE simulacoes_itens (
    id BIGSERIAL PRIMARY KEY,
    simulacao_id BIGINT NOT NULL,
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
    CONSTRAINT fk_simulacoes_itens_simulacao FOREIGN KEY (simulacao_id) REFERENCES simulacoes_financeiras(id),
    CONSTRAINT fk_simulacoes_itens_modalidade FOREIGN KEY (produto_modalidade_id) REFERENCES produtos_modalidades(id),
    CONSTRAINT fk_simulacoes_itens_preco FOREIGN KEY (produto_preco_id)
        REFERENCES produtos_precos(id) ON DELETE SET NULL,
    CONSTRAINT chk_simulacoes_itens_qtd CHECK (quantidade > 0),
    CONSTRAINT chk_simulacoes_itens_valor CHECK (valor_unitario >= 0)
);
CREATE INDEX idx_simulacoes_itens_simulacao ON simulacoes_itens (simulacao_id);

CREATE TABLE simulacoes_itens_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    simulacao_id BIGINT,
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
    CONSTRAINT fk_simulacoes_itens_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- Fecha a FK que a V102 deixou aberta (concessao pode nascer na simulacao).
ALTER TABLE concessoes_bolsa
    ADD CONSTRAINT fk_concessoes_bolsa_simulacao
    FOREIGN KEY (simulacao_id) REFERENCES simulacoes_financeiras(id);
