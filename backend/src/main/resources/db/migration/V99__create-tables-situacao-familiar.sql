-- Situação familiar do aluno: o que a orientação registra sobre o contexto de
-- casa. São dois pedaços: um texto descritivo livre e um conjunto de marcações
-- escolhidas de um catálogo.
--
-- O catálogo é tabela (e não enum) porque a escola precisa ajustar a lista sem
-- deploy, e porque relatórios futuros vão agrupar por opção — com id estável,
-- renomear a descrição não quebra o histórico já marcado.
--
-- Cada aluno tem no máximo uma situação familiar (aluno_id UNIQUE): o registro
-- é atualizado ao longo do tempo, e o histórico de quem mudou o quê fica por
-- conta do Envers.

CREATE TABLE situacao_familiar_opcoes (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    descricao VARCHAR(120) NOT NULL UNIQUE,
    ordem INTEGER NOT NULL DEFAULT 0,
    -- Opção aposentada some da tela mas continua válida nas marcações antigas.
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT
);

INSERT INTO situacao_familiar_opcoes (descricao, ordem) VALUES
('Mora com ambos os pais', 10),
('Mora somente com a mãe', 20),
('Mora somente com o pai', 30),
('Mora com os avós', 40),
('Mora com outros familiares', 50),
('Sob guarda ou tutela', 60),
('Em acolhimento institucional', 70),
('Beneficiário de programa social', 80),
('Responsável desempregado', 90),
('Bolsista ou com desconto', 100),
('Separação recente dos pais', 110),
('Luto familiar recente', 120),
('Doença grave na família', 130),
('Mudança recente de cidade ou escola', 140),
('Acompanhamento do Conselho Tutelar', 150),
('Responsável privado de liberdade', 160),
('Acompanhamento psicológico externo', 170),
('Acompanhamento psicopedagógico', 180),
('Família participativa na escola', 190);

CREATE TABLE situacoes_familiares (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    aluno_id BIGINT NOT NULL UNIQUE,
    descricao TEXT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_situacoes_familiares_aluno FOREIGN KEY (aluno_id)
        REFERENCES alunos(id) ON DELETE CASCADE
);

CREATE TABLE situacao_familiar_marcacoes (
    situacao_familiar_id BIGINT NOT NULL,
    opcao_id BIGINT NOT NULL,
    PRIMARY KEY (situacao_familiar_id, opcao_id),
    CONSTRAINT fk_situacao_familiar_marcacoes_situacao FOREIGN KEY (situacao_familiar_id)
        REFERENCES situacoes_familiares(id) ON DELETE CASCADE,
    CONSTRAINT fk_situacao_familiar_marcacoes_opcao FOREIGN KEY (opcao_id)
        REFERENCES situacao_familiar_opcoes(id)
);

-- O relatório vai partir da opção para contar alunos, não o contrário.
CREATE INDEX idx_situacao_familiar_marcacoes_opcao ON situacao_familiar_marcacoes(opcao_id);

CREATE TABLE IF NOT EXISTS situacao_familiar_opcoes_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    descricao VARCHAR(120),
    ordem INTEGER,
    ativo BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_situacao_familiar_opcoes_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS situacoes_familiares_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aluno_id BIGINT,
    descricao TEXT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_situacoes_familiares_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
