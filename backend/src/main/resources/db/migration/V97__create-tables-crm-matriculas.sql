-- CRM de matrículas (funil de captação/rematrícula) da Secretaria:
--  * origens_lead: catálogo de origens de lead (campanha, indicação, site, etc.)
--  * funil_estagios: catálogo configurável de estágios do funil (nome, ordem, SLA em dias)
--  * processos_matricula: o núcleo — uma tentativa de matrícula/rematrícula de um aluno em
--    um ciclo letivo, com estágio atual e responsável pelo atendimento. A "fila de
--    distribuição" não é tabela própria: é a query de processos com funcionario_id nulo.
--  * historico_estagios: trilha de entrada/saída de cada processo por estágio, para
--    relatórios de tempo médio por etapa do funil
--  * interacoes: log de contatos (ligação, whatsapp, e-mail, anotação, eventos do sistema)
--    com resultado e próxima ação — alimenta a lista de follow-up do dia

CREATE TABLE origens_lead (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT
);

INSERT INTO origens_lead (nome, atualizado_em) VALUES
    ('Campanha Instagram', NOW()),
    ('Indicação', NOW()),
    ('Orgânico (site)', NOW()),
    ('Feira de profissões', NOW()),
    ('Rematrícula (base)', NOW()),
    ('Outro', NOW());

CREATE TABLE funil_estagios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ordem INT NOT NULL UNIQUE,
    sla_dias INT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT
);

INSERT INTO funil_estagios (nome, ordem, sla_dias, atualizado_em) VALUES
    ('Novo lead', 1, 1, NOW()),
    ('Contato inicial', 2, 2, NOW()),
    ('Qualificação', 3, 3, NOW()),
    ('Visita agendada', 4, 5, NOW()),
    ('Proposta', 5, 5, NOW()),
    ('Documentação', 6, 3, NOW()),
    ('Matriculado', 7, NULL, NOW());

CREATE TABLE processos_matricula (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    origem_id BIGINT NOT NULL,
    estagio_atual_id BIGINT NOT NULL,
    funcionario_id BIGINT,
    tipo VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    subestagio VARCHAR(100),
    ano_letivo INT NOT NULL,
    responsavel_nome VARCHAR(255),
    responsavel_telefone VARCHAR(20),
    motivo_perda VARCHAR(255),
    data_conclusao TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_processos_matricula_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    CONSTRAINT fk_processos_matricula_origem FOREIGN KEY (origem_id) REFERENCES origens_lead(id),
    CONSTRAINT fk_processos_matricula_estagio FOREIGN KEY (estagio_atual_id) REFERENCES funil_estagios(id),
    CONSTRAINT fk_processos_matricula_funcionario FOREIGN KEY (funcionario_id) REFERENCES dados_pessoais(id)
);

CREATE TABLE historico_estagios (
    id BIGSERIAL PRIMARY KEY,
    processo_id BIGINT NOT NULL,
    estagio_id BIGINT NOT NULL,
    data_entrada TIMESTAMPTZ NOT NULL,
    data_saida TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_historico_estagios_processo FOREIGN KEY (processo_id) REFERENCES processos_matricula(id),
    CONSTRAINT fk_historico_estagios_estagio FOREIGN KEY (estagio_id) REFERENCES funil_estagios(id)
);

CREATE TABLE interacoes (
    id BIGSERIAL PRIMARY KEY,
    processo_id BIGINT NOT NULL,
    funcionario_id BIGINT,
    tipo VARCHAR(20) NOT NULL,
    resultado VARCHAR(100),
    observacoes TEXT,
    proxima_acao TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_interacoes_processo FOREIGN KEY (processo_id) REFERENCES processos_matricula(id),
    CONSTRAINT fk_interacoes_funcionario FOREIGN KEY (funcionario_id) REFERENCES dados_pessoais(id)
);

CREATE TABLE origens_lead_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(100),
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_origens_lead_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE funil_estagios_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(100),
    ordem INT,
    sla_dias INT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_funil_estagios_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE processos_matricula_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aluno_id BIGINT,
    origem_id BIGINT,
    estagio_atual_id BIGINT,
    funcionario_id BIGINT,
    tipo VARCHAR(20),
    status VARCHAR(20),
    subestagio VARCHAR(100),
    ano_letivo INT,
    responsavel_nome VARCHAR(255),
    responsavel_telefone VARCHAR(20),
    motivo_perda VARCHAR(255),
    data_conclusao TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_processos_matricula_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE historico_estagios_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    processo_id BIGINT,
    estagio_id BIGINT,
    data_entrada TIMESTAMPTZ,
    data_saida TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_historico_estagios_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE interacoes_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    processo_id BIGINT,
    funcionario_id BIGINT,
    tipo VARCHAR(20),
    resultado VARCHAR(100),
    observacoes TEXT,
    proxima_acao TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_interacoes_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
