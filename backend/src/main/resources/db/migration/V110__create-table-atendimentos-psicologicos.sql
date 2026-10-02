-- Atendimentos psicológicos do aluno registrados pela orientação.
--
-- O nome carrega "psicologicos" de propósito: no restante do sistema
-- "atendimento" já significa conversa do Fale Conosco dirigida ao ORIENTADOR
-- (ver InicioOrientacaoDto), e são coisas diferentes.
--
-- O profissional é texto livre porque o psicólogo costuma ser externo e não tem
-- login no sistema. Quem digitou fica em criado_por, vindo da sessão.
--
-- Registro é histórico clínico: a aplicação só acrescenta, nunca edita nem
-- apaga. Por isso não há coluna de status ou exclusão lógica.

CREATE TABLE atendimentos_psicologicos (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    data DATE NOT NULL,
    profissional VARCHAR(120),
    descricao TEXT NOT NULL,
    -- Laudo da ficha médica citado no atendimento. SET NULL: se o laudo for
    -- removido da ficha, o atendimento sobrevive sem a referência — o relato
    -- clínico está na descrição, o laudo é apoio.
    laudo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_atendimentos_psicologicos_aluno FOREIGN KEY (aluno_id)
        REFERENCES alunos(id) ON DELETE CASCADE,
    CONSTRAINT fk_atendimentos_psicologicos_laudo FOREIGN KEY (laudo_id)
        REFERENCES laudos_medicos(id) ON DELETE SET NULL
);

-- A aba lista sempre por aluno, do mais recente para o mais antigo.
CREATE INDEX idx_atendimentos_psicologicos_aluno
    ON atendimentos_psicologicos(aluno_id, data DESC);

CREATE TABLE IF NOT EXISTS atendimentos_psicologicos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aluno_id BIGINT,
    data DATE,
    profissional VARCHAR(120),
    descricao TEXT,
    laudo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_atendimentos_psicologicos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
