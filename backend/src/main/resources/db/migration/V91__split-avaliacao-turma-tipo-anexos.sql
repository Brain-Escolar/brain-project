-- 1) avaliacoes_turmas (+ _AUD) -- aplicacao de uma avaliacao numa turma especifica
CREATE TABLE avaliacoes_turmas (
    id BIGSERIAL PRIMARY KEY,
    avaliacao_id BIGINT NOT NULL,
    turma_id BIGINT NOT NULL,
    professor_id BIGINT,
    data_aplicacao DATE,
    data_entrega_notas DATE,
    evento_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_avaliacoes_turmas_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id),
    CONSTRAINT fk_avaliacoes_turmas_turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
    CONSTRAINT fk_avaliacoes_turmas_professor FOREIGN KEY (professor_id) REFERENCES professores(id),
    CONSTRAINT fk_avaliacoes_turmas_evento FOREIGN KEY (evento_id) REFERENCES eventos(id),
    CONSTRAINT uq_avaliacoes_turmas_avaliacao_turma UNIQUE (avaliacao_id, turma_id)
);

CREATE TABLE avaliacoes_turmas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    avaliacao_id BIGINT,
    turma_id BIGINT,
    professor_id BIGINT,
    data_aplicacao DATE,
    data_entrega_notas DATE,
    evento_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_avaliacoes_turmas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- 2) tipo em avaliacoes (backfill PROVA -- unico tipo implicito ate hoje)
ALTER TABLE avaliacoes ADD COLUMN tipo VARCHAR(50);
ALTER TABLE avaliacoes_AUD ADD COLUMN tipo VARCHAR(50);
ALTER TABLE avaliacoes ALTER COLUMN tipo SET NOT NULL;

-- 3) avaliacoes_anexos (+ _AUD) -- padrao LaudoMedico (PK propria, N avaliacao : N arquivo)
CREATE TABLE avaliacoes_anexos (
    id BIGSERIAL PRIMARY KEY,
    avaliacao_id BIGINT NOT NULL,
    arquivo_id BIGINT NOT NULL,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_avaliacoes_anexos_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id),
    CONSTRAINT fk_avaliacoes_anexos_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivos(id),
    CONSTRAINT uq_avaliacoes_anexos_avaliacao_arquivo UNIQUE (avaliacao_id, arquivo_id)
);

CREATE TABLE avaliacoes_anexos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    avaliacao_id BIGINT,
    arquivo_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_avaliacoes_anexos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- 4) migra dados: avaliacoes (turma/professor/datas/evento) -> avaliacoes_turmas
--    id novo, autogerado -- avaliacoes_turmas.avaliacao_id preserva o id antigo de avaliacoes,
--    o que da uma correlacao 1:1 estavel pra remapear notas/eventos abaixo, sem precisar
--    manipular sequence (mais portavel entre Postgres e H2, usado nos testes)
INSERT INTO avaliacoes_turmas (
    avaliacao_id, turma_id, professor_id, data_aplicacao, data_entrega_notas, evento_id,
    criado_em, criado_por, atualizado_em, atualizado_por
)
SELECT id, turma_id, professor_id, data_aplicacao, data_entrega_notas, evento_id,
       criado_em, criado_por, atualizado_em, atualizado_por
FROM avaliacoes
WHERE turma_id IS NOT NULL;

-- 5) eventos.avaliacao_id -> eventos.avaliacao_turma_id (entrega de notas passa a ser por turma)
ALTER TABLE eventos ADD COLUMN avaliacao_turma_id BIGINT;
UPDATE eventos e
SET avaliacao_turma_id = (
    SELECT at2.id FROM avaliacoes_turmas at2 WHERE at2.avaliacao_id = e.avaliacao_id
)
WHERE e.avaliacao_id IS NOT NULL;
ALTER TABLE eventos ADD CONSTRAINT fk_eventos_avaliacao_turma FOREIGN KEY (avaliacao_turma_id) REFERENCES avaliacoes_turmas(id);
ALTER TABLE eventos DROP CONSTRAINT IF EXISTS fk_eventos_avaliacao;
ALTER TABLE eventos DROP COLUMN avaliacao_id;

ALTER TABLE eventos_AUD ADD COLUMN avaliacao_turma_id BIGINT;
UPDATE eventos_AUD ea
SET avaliacao_turma_id = (
    SELECT at2.id FROM avaliacoes_turmas at2 WHERE at2.avaliacao_id = ea.avaliacao_id
)
WHERE ea.avaliacao_id IS NOT NULL;
ALTER TABLE eventos_AUD DROP COLUMN avaliacao_id;

-- 6) notas.avaliacao_id -> notas.avaliacao_turma_id
--    Constraint original (V47) e implicita, nome default do Postgres: notas_avaliacao_id_fkey
ALTER TABLE notas DROP CONSTRAINT IF EXISTS notas_avaliacao_id_fkey;
UPDATE notas n
SET avaliacao_id = (
    SELECT at2.id FROM avaliacoes_turmas at2 WHERE at2.avaliacao_id = n.avaliacao_id
)
WHERE EXISTS (SELECT 1 FROM avaliacoes_turmas at2 WHERE at2.avaliacao_id = n.avaliacao_id);
ALTER TABLE notas RENAME COLUMN avaliacao_id TO avaliacao_turma_id;
ALTER TABLE notas ADD CONSTRAINT fk_notas_avaliacao_turma FOREIGN KEY (avaliacao_turma_id) REFERENCES avaliacoes_turmas(id);

ALTER TABLE notas_AUD RENAME COLUMN avaliacao_id TO avaliacao_turma_id;
UPDATE notas_AUD na
SET avaliacao_turma_id = (
    SELECT at2.id FROM avaliacoes_turmas at2 WHERE at2.avaliacao_id = na.avaliacao_turma_id
)
WHERE EXISTS (SELECT 1 FROM avaliacoes_turmas at2 WHERE at2.avaliacao_id = na.avaliacao_turma_id);

-- 7) remove de avaliacoes as colunas que migraram para avaliacoes_turmas
ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS fk_avaliacoes_turma;
ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS fk_avaliacoes_evento;
ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS fk_avaliacoes_professor;
ALTER TABLE avaliacoes DROP COLUMN turma_id;
ALTER TABLE avaliacoes DROP COLUMN data_aplicacao;
ALTER TABLE avaliacoes DROP COLUMN data_entrega_notas;
ALTER TABLE avaliacoes DROP COLUMN evento_id;
ALTER TABLE avaliacoes DROP COLUMN professor_id;

ALTER TABLE avaliacoes_AUD DROP COLUMN turma_id;
ALTER TABLE avaliacoes_AUD DROP COLUMN data_aplicacao;
ALTER TABLE avaliacoes_AUD DROP COLUMN data_entrega_notas;
ALTER TABLE avaliacoes_AUD DROP COLUMN evento_id;
ALTER TABLE avaliacoes_AUD DROP COLUMN professor_id;
