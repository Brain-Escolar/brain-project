-- Bolsa estudantil: duas perguntas diferentes, duas familias de tabela.
--   matrizes_desconto + alcadas_desconto -> "esse aluno pode receber 40%?"
--   envelopes_bolsa + movimentos_envelope -> "a escola ainda aguenta?"
--
-- CEBAS e teto sao CONFIGURACAO, nao regra no codigo: um envelope declara sua
-- natureza (teto ou piso) e sua unidade de medida (R$, % da receita, numero de
-- bolsas equivalentes, ou nenhum limite). Sem CEBAS simplesmente nao se criam
-- envelopes de natureza META_MINIMA.
--
-- Multi-tenancy e schema por escola, entao nao ha mantenedora_id: a politica e
-- unica por ano letivo dentro do schema.

CREATE TABLE politicas_bolsa (
    id BIGSERIAL PRIMARY KEY,
    ano_letivo INTEGER NOT NULL UNIQUE,
    exige_cebas BOOLEAN NOT NULL DEFAULT FALSE,
    observacao TEXT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT
);

-- politicas_bolsa.exige_cebas: Mantenedora filantropica neste ano letivo.
--   Quando FALSE, nenhum envelope de natureza META_MINIMA e criado e nada
--   mais no modelo muda.

CREATE TABLE tipos_bolsa (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    estrutural BOOLEAN NOT NULL,
    exige_comprovacao BOOLEAN NOT NULL DEFAULT FALSE,
    conta_para_cebas BOOLEAN NOT NULL DEFAULT FALSE,
    acumula_com_outras BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT
);

-- tipos_bolsa.estrutural: TRUE = renuncia planejada (social, irmao,
--   funcionario) -> consome envelope. FALSE = incentivo condicional
--   (pontualidade, antecipacao) -> NAO consome. Juntar os dois infla o numero
--   da renuncia e o torna inutil para decidir.
-- tipos_bolsa.exige_comprovacao: Exige documentacao socioeconomica (renda per
--   capita), como pede o CEBAS

INSERT INTO tipos_bolsa (codigo, nome, estrutural, exige_comprovacao, conta_para_cebas, atualizado_em) VALUES
    ('SOCIAL',       'Bolsa social',              TRUE,  TRUE,  TRUE,  NOW()),
    ('IRMAO',        'Desconto irmao',            TRUE,  FALSE, FALSE, NOW()),
    ('FUNCIONARIO',  'Bolsa de funcionario',      TRUE,  FALSE, FALSE, NOW()),
    ('CONVENIO',     'Convenio empresa',          TRUE,  FALSE, FALSE, NOW()),
    ('MERITO',       'Bolsa de merito',           TRUE,  FALSE, FALSE, NOW()),
    ('PONTUALIDADE', 'Desconto de pontualidade',  FALSE, FALSE, FALSE, NOW());

-- Sobre quais itens a bolsa incide: mensalidade sim, passeio nao.
CREATE TABLE tipos_bolsa_produtos (
    tipo_bolsa_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    PRIMARY KEY (tipo_bolsa_id, produto_id),
    CONSTRAINT fk_tipos_bolsa_produtos_tipo FOREIGN KEY (tipo_bolsa_id) REFERENCES tipos_bolsa(id),
    -- CASCADE: o vinculo de bolsa nao pode impedir a escola de apagar um produto
    CONSTRAINT fk_tipos_bolsa_produtos_produto FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE matrizes_desconto (
    id BIGSERIAL PRIMARY KEY,
    politica_id BIGINT NOT NULL,
    tipo_bolsa_id BIGINT NOT NULL,
    unidade_id BIGINT,
    serie_id BIGINT,
    percentual_max DECIMAL(5,2) NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_matrizes_desconto_politica FOREIGN KEY (politica_id) REFERENCES politicas_bolsa(id),
    CONSTRAINT fk_matrizes_desconto_tipo FOREIGN KEY (tipo_bolsa_id) REFERENCES tipos_bolsa(id),
    CONSTRAINT fk_matrizes_desconto_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id),
    CONSTRAINT fk_matrizes_desconto_serie FOREIGN KEY (serie_id) REFERENCES series(id),
    CONSTRAINT chk_matrizes_desconto_pct CHECK (percentual_max > 0 AND percentual_max <= 100),
    CONSTRAINT chk_matrizes_desconto_vigencia CHECK (vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio)
);
CREATE INDEX idx_matrizes_desconto_busca ON matrizes_desconto (politica_id, tipo_bolsa_id);

-- matrizes_desconto: A matriz de descontos: quanto cada tipo de bolsa pode
--   chegar, por serie e unidade. NULL em serie/unidade = vale para qualquer;
--   a regra mais especifica vence: serie > unidade > geral (resolver no servico).

CREATE TABLE alcadas_desconto (
    id BIGSERIAL PRIMARY KEY,
    politica_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,
    percentual_max DECIMAL(5,2) NOT NULL,
    pode_exceder_envelope BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_alcadas_desconto_politica FOREIGN KEY (politica_id) REFERENCES politicas_bolsa(id),
    CONSTRAINT fk_alcadas_desconto_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id),
    CONSTRAINT uq_alcadas_desconto_politica_perfil UNIQUE (politica_id, perfil_id),
    CONSTRAINT chk_alcadas_desconto_pct CHECK (percentual_max >= 0 AND percentual_max <= 100)
);

-- alcadas_desconto.pode_exceder_envelope: Quem pode autorizar concessao que
--   estoura o orcamento. Furar a alcada bloqueia e escala; furar o envelope
--   avisa e exige este aval.

CREATE TABLE envelopes_bolsa (
    id BIGSERIAL PRIMARY KEY,
    politica_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    natureza VARCHAR(20) NOT NULL,
    unidade_medida VARCHAR(30) NOT NULL,

    valor_limite DECIMAL(12,2),
    percentual_limite DECIMAL(5,2),
    quantidade_limite DECIMAL(8,2),

    base_calculo VARCHAR(30),
    receita_projetada DECIMAL(12,2),

    unidade_id BIGINT,
    serie_id BIGINT,
    tipo_bolsa_id BIGINT,

    permite_excedente BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    -- Cache atualizado na MESMA transacao do movimento, sob SELECT ... FOR UPDATE.
    -- A verdade e movimentos_envelope; isto existe para a tela nao varrer o razao
    -- a cada tecla. Um job diario deve conferir o cache contra o razao.
    reservado DECIMAL(12,2) NOT NULL DEFAULT 0,
    comprometido DECIMAL(12,2) NOT NULL DEFAULT 0,
    reservado_equiv DECIMAL(10,2) NOT NULL DEFAULT 0,
    comprometido_equiv DECIMAL(10,2) NOT NULL DEFAULT 0,

    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,

    CONSTRAINT fk_envelopes_bolsa_politica FOREIGN KEY (politica_id) REFERENCES politicas_bolsa(id),
    CONSTRAINT fk_envelopes_bolsa_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id),
    CONSTRAINT fk_envelopes_bolsa_serie FOREIGN KEY (serie_id) REFERENCES series(id),
    CONSTRAINT fk_envelopes_bolsa_tipo FOREIGN KEY (tipo_bolsa_id) REFERENCES tipos_bolsa(id),
    CONSTRAINT chk_envelopes_bolsa_natureza CHECK (natureza IN ('LIMITE_MAXIMO','META_MINIMA')),
    CONSTRAINT chk_envelopes_bolsa_unidade_medida CHECK (unidade_medida IN
        ('VALOR_ABSOLUTO','PERCENTUAL_RECEITA','QUANTIDADE_EQUIVALENTE','SEM_LIMITE')),
    CONSTRAINT chk_envelopes_bolsa_base CHECK (base_calculo IS NULL OR base_calculo IN
        ('RECEITA_REALIZADA','RECEITA_PROJETADA')),
    CONSTRAINT chk_envelopes_bolsa_valor CHECK (
        unidade_medida <> 'VALOR_ABSOLUTO' OR (valor_limite IS NOT NULL AND valor_limite >= 0)),
    CONSTRAINT chk_envelopes_bolsa_percentual CHECK (
        unidade_medida <> 'PERCENTUAL_RECEITA' OR (
            percentual_limite IS NOT NULL AND percentual_limite > 0
            AND base_calculo IS NOT NULL
            AND (base_calculo <> 'RECEITA_PROJETADA' OR receita_projetada IS NOT NULL))),
    CONSTRAINT chk_envelopes_bolsa_quantidade CHECK (
        unidade_medida <> 'QUANTIDADE_EQUIVALENTE' OR (quantidade_limite IS NOT NULL AND quantidade_limite > 0)),
    CONSTRAINT chk_envelopes_bolsa_sem_limite CHECK (
        unidade_medida <> 'SEM_LIMITE' OR (
            valor_limite IS NULL AND percentual_limite IS NULL AND quantidade_limite IS NULL))
);
CREATE INDEX idx_envelopes_bolsa_politica ON envelopes_bolsa (politica_id, ativo);

-- envelopes_bolsa: Orcamento de bolsa. LIMITE_MAXIMO = teto comercial (alerta
--   ao estourar); META_MINIMA = piso filantropico/CEBAS (alerta ao faltar).
--   Mesmas colunas, muda so o sentido da comparacao. Escopo todo NULL =
--   envelope global do ano.
-- envelopes_bolsa.base_calculo: O denominador do teto percentual se move:
--   RECEITA_REALIZADA cresce durante a campanha (e vale quase zero no inicio,
--   travando tudo); RECEITA_PROJETADA usa a meta do ano. Recalcular a cada
--   avaliacao, nunca cachear o teto.
-- envelopes_bolsa.reservado: Cache. Fonte da verdade e movimentos_envelope.

CREATE TABLE envelopes_bolsa_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    politica_id BIGINT,
    nome VARCHAR(100),
    natureza VARCHAR(20),
    unidade_medida VARCHAR(30),
    valor_limite DECIMAL(12,2),
    percentual_limite DECIMAL(5,2),
    quantidade_limite DECIMAL(8,2),
    base_calculo VARCHAR(30),
    receita_projetada DECIMAL(12,2),
    unidade_id BIGINT,
    serie_id BIGINT,
    tipo_bolsa_id BIGINT,
    permite_excedente BOOLEAN,
    ativo BOOLEAN,
    reservado DECIMAL(12,2),
    comprometido DECIMAL(12,2),
    reservado_equiv DECIMAL(10,2),
    comprometido_equiv DECIMAL(10,2),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_envelopes_bolsa_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE concessoes_bolsa (
    id BIGSERIAL PRIMARY KEY,
    tipo_bolsa_id BIGINT NOT NULL,
    simulacao_id BIGINT,
    contrato_id BIGINT,
    percentual DECIMAL(5,2) NOT NULL,
    valor_renuncia_anual DECIMAL(10,2) NOT NULL,
    equivalente_bolsa DECIMAL(4,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE,
    motivo TEXT,
    solicitado_por BIGINT NOT NULL,
    aprovado_por BIGINT,
    aprovado_em TIMESTAMPTZ,
    excedeu_envelope BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_concessoes_bolsa_tipo FOREIGN KEY (tipo_bolsa_id) REFERENCES tipos_bolsa(id),
    CONSTRAINT fk_concessoes_bolsa_contrato FOREIGN KEY (contrato_id) REFERENCES contratos_servico(id),
    CONSTRAINT fk_concessoes_bolsa_solicitante FOREIGN KEY (solicitado_por) REFERENCES dados_pessoais(id),
    CONSTRAINT fk_concessoes_bolsa_aprovador FOREIGN KEY (aprovado_por) REFERENCES dados_pessoais(id),
    CONSTRAINT chk_concessoes_bolsa_status CHECK (status IN
        ('SIMULADA','RESERVADA','ATIVA','ENCERRADA','CANCELADA')),
    CONSTRAINT chk_concessoes_bolsa_pct CHECK (percentual > 0 AND percentual <= 100),
    CONSTRAINT chk_concessoes_bolsa_valor CHECK (valor_renuncia_anual >= 0),
    CONSTRAINT chk_concessoes_bolsa_equiv CHECK (equivalente_bolsa >= 0 AND equivalente_bolsa <= 1),
    CONSTRAINT chk_concessoes_bolsa_origem CHECK (simulacao_id IS NOT NULL OR contrato_id IS NOT NULL),
    CONSTRAINT chk_concessoes_bolsa_excedente CHECK (NOT excedeu_envelope OR aprovado_por IS NOT NULL)
);
CREATE INDEX idx_concessoes_bolsa_contrato ON concessoes_bolsa (contrato_id);
CREATE INDEX idx_concessoes_bolsa_status ON concessoes_bolsa (status);

-- concessoes_bolsa.equivalente_bolsa: Bolsa-equivalente para contagem CEBAS:
--   1.00 = integral, 0.50 = metade. Gravado junto do valor em R$ para o mesmo
--   razao servir a envelope em dinheiro e a envelope em numero de alunos.
-- concessoes_bolsa.aprovado_por: Coluna propria, nao consulta ao Envers: o
--   relatorio de bolsa agrega por aprovador e isso nao se faz sobre tabela de
--   auditoria.

CREATE TABLE concessoes_bolsa_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    tipo_bolsa_id BIGINT,
    simulacao_id BIGINT,
    contrato_id BIGINT,
    percentual DECIMAL(5,2),
    valor_renuncia_anual DECIMAL(10,2),
    equivalente_bolsa DECIMAL(4,2),
    status VARCHAR(20),
    vigencia_inicio DATE,
    vigencia_fim DATE,
    motivo TEXT,
    solicitado_por BIGINT,
    aprovado_por BIGINT,
    aprovado_em TIMESTAMPTZ,
    excedeu_envelope BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_concessoes_bolsa_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- O razao: fonte da verdade do saldo. Append-only.
CREATE TABLE movimentos_envelope (
    id BIGSERIAL PRIMARY KEY,
    envelope_id BIGINT NOT NULL,
    concessao_id BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    equivalente_bolsa DECIMAL(4,2) NOT NULL,
    expira_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_por BIGINT,
    CONSTRAINT fk_movimentos_envelope_envelope FOREIGN KEY (envelope_id) REFERENCES envelopes_bolsa(id),
    CONSTRAINT fk_movimentos_envelope_concessao FOREIGN KEY (concessao_id) REFERENCES concessoes_bolsa(id),
    CONSTRAINT chk_movimentos_envelope_tipo CHECK (tipo IN
        ('RESERVA','LIBERACAO','COMPROMISSO','ESTORNO','AJUSTE')),
    -- sinal coerente com o tipo: entradas positivas, devolucoes negativas
    CONSTRAINT chk_movimentos_envelope_sinal CHECK (
        (tipo IN ('RESERVA','COMPROMISSO') AND valor >= 0) OR
        (tipo IN ('LIBERACAO','ESTORNO') AND valor <= 0) OR
        (tipo = 'AJUSTE')),
    CONSTRAINT chk_movimentos_envelope_expira CHECK (tipo = 'RESERVA' OR expira_em IS NULL)
);
CREATE INDEX idx_movimentos_envelope_envelope ON movimentos_envelope (envelope_id, tipo);
CREATE INDEX idx_movimentos_envelope_concessao ON movimentos_envelope (concessao_id);
CREATE INDEX idx_movimentos_envelope_expira ON movimentos_envelope (expira_em);

-- movimentos_envelope: Razao de consumo do orcamento. Append-only: correcao e
--   movimento novo de sinal oposto, nunca UPDATE. Uma concessao gera uma
--   linha POR envelope atingido (o global, o da serie e o do tipo, por
--   exemplo).

-- movimentos_envelope e append-only por REGRA DE SERVICO: correcao se faz com
-- movimento novo de sinal oposto, nunca UPDATE ou DELETE. Nao ha gatilho
-- guardando isso -- o repositorio nao deve expor save() nem delete() para esta
-- entidade, so o insert.
