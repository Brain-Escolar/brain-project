-- Documentacao de matricula (aluno e responsaveis) e foto da pessoa.
--
-- O documento pertence a PESSOA (dados_pessoais), nao ao papel: o RG de um
-- responsavel com dois filhos na escola e enviado e validado uma vez so.
--
-- Um registro por pessoa/tipo. Reenviar (apos rejeicao, ou RG novo) troca os
-- arquivos do mesmo registro e volta para EM_ANALISE; o historico de quem
-- enviou, aprovou ou rejeitou fica no _AUD. Os arquivos antigos NAO sao
-- apagados do S3 -- a auditoria continua apontando para eles.
--
-- "Pendente" nao e status: e a ausencia do registro para um tipo exigido.

CREATE TABLE documentos (
    id BIGSERIAL PRIMARY KEY,
    dados_pessoais_id BIGINT NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL,
    motivo_rejeicao TEXT,
    data_validade DATE,
    enviado_em TIMESTAMPTZ NOT NULL,
    validado_por BIGINT,
    validado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT fk_documentos_dados_pessoais FOREIGN KEY (dados_pessoais_id) REFERENCES dados_pessoais(id),
    CONSTRAINT fk_documentos_validado_por FOREIGN KEY (validado_por) REFERENCES dados_pessoais(id),
    CONSTRAINT chk_documentos_status CHECK (status IN ('EM_ANALISE', 'APROVADO', 'REJEITADO'))
);

CREATE UNIQUE INDEX uq_documentos_pessoa_tipo ON documentos (dados_pessoais_id, tipo);
CREATE INDEX idx_documentos_status ON documentos (status);

-- Frente e verso, ou um PDF por pagina: um documento tem N arquivos.
CREATE TABLE documentos_arquivos (
    documento_id BIGINT NOT NULL,
    arquivo_id BIGINT NOT NULL,
    PRIMARY KEY (documento_id, arquivo_id),
    CONSTRAINT fk_documentos_arquivos_documento FOREIGN KEY (documento_id) REFERENCES documentos(id),
    CONSTRAINT fk_documentos_arquivos_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivos(id)
);

CREATE TABLE documentos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    tipo VARCHAR(40),
    status VARCHAR(20),
    motivo_rejeicao TEXT,
    data_validade DATE,
    enviado_em TIMESTAMPTZ,
    validado_por BIGINT,
    validado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_documentos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- Auditada de proposito: e o que responde "quais arquivos estavam la quando
-- a secretaria aprovou".
CREATE TABLE documentos_arquivos_AUD (
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    documento_id BIGINT NOT NULL,
    arquivo_id BIGINT NOT NULL,
    PRIMARY KEY (rev, documento_id, arquivo_id),
    CONSTRAINT fk_documentos_arquivos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- ---------------------------------------------------------------------------
-- Foto: 1:1 com a pessoa, sem validacao -- coluna direta, nao documento.
-- ---------------------------------------------------------------------------
ALTER TABLE dados_pessoais ADD COLUMN foto_arquivo_id BIGINT;
ALTER TABLE dados_pessoais
    ADD CONSTRAINT fk_dados_pessoais_foto FOREIGN KEY (foto_arquivo_id) REFERENCES arquivos(id);

ALTER TABLE dados_pessoais_AUD ADD COLUMN foto_arquivo_id BIGINT;
