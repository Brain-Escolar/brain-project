-- Hibernate Envers _AUD shadow tables for all @Audited entities

CREATE TABLE IF NOT EXISTS alertas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    titulo VARCHAR(255),
    conteudo VARCHAR(255),
    data_publicacao DATE,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_alertas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS alunos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    unidade_id BIGINT,
    serie_id BIGINT,
    turma_id BIGINT,
    dados_pessoais_id BIGINT,
    matriculado BOOLEAN,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_alunos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS anotacoes_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aluno_id BIGINT,
    aula_id BIGINT,
    tipo_anotacao VARCHAR(255),
    data_anotacao DATE,
    observacao VARCHAR(255),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_anotacoes_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS arquivos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    s3_key VARCHAR(255),
    nome_original VARCHAR(255),
    content_type VARCHAR(255),
    tamanho BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_arquivos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS aulas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    disciplina_id BIGINT,
    turma_id BIGINT,
    professor_id BIGINT,
    dia_semana VARCHAR(255),
    horario_id BIGINT,
    sala VARCHAR(255),
    vigencia DATE,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_aulas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS avaliacoes_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(255),
    disciplina_id BIGINT,
    peso NUMERIC(19,2),
    conteudo VARCHAR(255),
    nota_extra BOOLEAN,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_avaliacoes_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS chamadas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aula_id BIGINT,
    aluno_id BIGINT,
    data_chamada DATE,
    atualizado_por BIGINT,
    presente BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_chamadas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS comunicados_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    titulo VARCHAR(255),
    conteudo VARCHAR(255),
    data_publicacao DATE,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_comunicados_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS conteudos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    conteudo VARCHAR(255),
    aula_id BIGINT,
    data_conteudo DATE,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_conteudos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS coordenadores_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_coordenadores_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS dados_autenticacao_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    email VARCHAR(255),
    senha VARCHAR(255),
    verificado BOOLEAN,
    token VARCHAR(255),
    expiracao_token TIMESTAMP,
    ativo BOOLEAN,
    google_access_token VARCHAR(255),
    google_refresh_token VARCHAR(255),
    google_token_expiracao TIMESTAMP,
    google_id VARCHAR(255),
    dados_pessoais_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_dados_autenticacao_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS dados_pessoais_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    cpf VARCHAR(255),
    rg VARCHAR(255),
    matricula VARCHAR(255),
    nome VARCHAR(255),
    nome_social VARCHAR(255),
    email VARCHAR(255),
    email_profissional VARCHAR(255),
    data_de_nascimento DATE,
    logradouro VARCHAR(255),
    bairro VARCHAR(255),
    cep VARCHAR(255),
    complemento VARCHAR(255),
    numero VARCHAR(255),
    uf VARCHAR(255),
    cidade VARCHAR(255),
    genero VARCHAR(255),
    cidade_naturalidade VARCHAR(255),
    cor_raca VARCHAR(255),
    carteira_de_trabalho VARCHAR(255),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_dados_pessoais_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS diretores_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_diretores_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS disciplinas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    serie_id BIGINT,
    nome VARCHAR(255),
    carga_horaria INTEGER,
    grupo_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_disciplinas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS disponibilidade_professor_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    professor_id BIGINT,
    horario_id BIGINT,
    data_vigencia DATE,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_disponibilidade_professor_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS fichas_medicas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    tipo_sanguineo VARCHAR(255),
    necessidades_especiais VARCHAR(255),
    doencas_respiratorias VARCHAR(255),
    alergias_alimentares VARCHAR(255),
    alergias_medicamentosas VARCHAR(255),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_fichas_medicas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS grupos_disciplinas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(255),
    area VARCHAR(255),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_grupos_disciplinas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS horarios_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(255),
    horario_inicio TIME,
    horario_fim TIME,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_horarios_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS laudos_medicos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    arquivo_id BIGINT,
    ficha_medica_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_laudos_medicos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS notas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    aluno_id BIGINT,
    avaliacao_id BIGINT,
    pontuacao NUMERIC(19,2),
    periodo_referencia DATE,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_notas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS orientadores_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_orientadores_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS perfis_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(255),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_perfis_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS planejamentos_anuais_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    ano INTEGER,
    arquivo_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_planejamentos_anuais_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS professores_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    atualizado_por BIGINT,
    ativo BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_professores_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS recursos_humanos_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_recursos_humanos_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS responsaveis_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    financeiro BOOLEAN,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_responsaveis_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS secretarios_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_secretarios_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS series_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(255),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_series_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS tarefas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    titulo VARCHAR(255),
    conteudo VARCHAR(255),
    documento_url VARCHAR(255),
    professor_id BIGINT,
    data_criacao DATE,
    prazo DATE,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_tarefas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS telefones_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    numero VARCHAR(255),
    dados_pessoais_id BIGINT,
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_telefones_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS turmas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    unidade_id BIGINT,
    serie_id BIGINT,
    nome VARCHAR(255),
    vagas INTEGER,
    ano_letivo INTEGER,
    turno VARCHAR(255),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_turmas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS unidades_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    nome VARCHAR(255),
    atualizado_por BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_unidades_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
