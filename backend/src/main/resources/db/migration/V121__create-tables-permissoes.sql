-- Permissões configuráveis por grupo de usuários. Spec: docs/permissoes.md
--
-- Catálogo (telas, controles e o teto por perfil) pertence ao código e só muda
-- por migration. Grupos, acessos dos grupos e membros pertencem a cada escola.
--
-- ADMIN não passa por grupos: recebe o teto inteiro do perfil ADMIN, que
-- reproduz o que ele vê hoje. Os demais perfis ganham um grupo padrão com tudo
-- o que já acessam, e cada pessoa entra no grupo padrão de cada perfil que tem:
-- o sistema continua se comportando exatamente como antes. Linhas criadas aqui
-- ficam com criado_por NULL (sistema) e sem revisão no Envers; o histórico
-- começa na primeira alteração pela tela.

-- ── Catálogo ──────────────────────────────────────────────────────────────

-- codigo = chave do RoutesEnum no frontend. Front, back e seed se referem à
-- tela pelo código, nunca pelo id nem pela rota.
CREATE TABLE telas (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    codigo VARCHAR(80) NOT NULL,
    nome VARCHAR(120) NOT NULL,
    rota VARCHAR(200) NOT NULL,
    -- Informativo: o menu continua montado pelo routesConfig. Aqui só separa,
    -- na tela de grupos, as telas de menu das páginas internas.
    exibir_menu BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT uk_telas_codigo UNIQUE (codigo)
);

-- Teto: a quais perfis a tela PODE ser concedida. Tela sem linha aqui não é de
-- ninguém. Um grupo nunca concede tela fora do teto do seu perfil, e o ADMIN
-- recebe exatamente o teto do perfil ADMIN.
CREATE TABLE telas_perfis (
    tela_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,
    PRIMARY KEY (tela_id, perfil_id),
    CONSTRAINT fk_telas_perfis_tela FOREIGN KEY (tela_id) REFERENCES telas(id),
    CONSTRAINT fk_telas_perfis_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id)
);

-- Capacidade dentro de uma tela (aba, seção, botão, campo). codigo no formato
-- DOMINIO.ACAO, sempre positivo (VER, EDITAR), nunca ESCONDER_X.
-- tela_id NULL = controle de dado, que vale em qualquer tela que mostre o dado
-- (o backend não sabe de qual tela veio a requisição).
CREATE TABLE controles (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    tela_id BIGINT,
    codigo VARCHAR(100) NOT NULL,
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT uk_controles_codigo UNIQUE (codigo),
    CONSTRAINT fk_controles_tela FOREIGN KEY (tela_id) REFERENCES telas(id)
);

CREATE TABLE controles_perfis (
    controle_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,
    PRIMARY KEY (controle_id, perfil_id),
    CONSTRAINT fk_controles_perfis_controle FOREIGN KEY (controle_id) REFERENCES controles(id),
    CONSTRAINT fk_controles_perfis_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id)
);

-- ── Grupos ────────────────────────────────────────────────────────────────

-- O perfil do grupo não muda depois de criado: acessos e membros dependem dele.
-- padrao = grupo de referência do perfil, criado aqui com todas as pessoas do
-- perfil; não pode ser excluído nem desativado. Exatamente um por perfil,
-- garantido aqui e no serviço (não há endpoint que crie grupo padrão). Pessoas
-- cadastradas depois ainda não entram sozinhas (docs/permissoes.md, seção 8.4).
CREATE TABLE grupos_usuarios (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    perfil_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    padrao BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT uk_grupos_usuarios_perfil_nome UNIQUE (perfil_id, nome),
    CONSTRAINT fk_grupos_usuarios_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id)
);

-- Vínculos sem ON DELETE CASCADE do lado do grupo: o serviço remove pelo JPA,
-- para o Envers registrar quem tirou o acesso de quem.
CREATE TABLE grupos_usuarios_telas (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    grupo_usuario_id BIGINT NOT NULL,
    tela_id BIGINT NOT NULL,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT uk_grupos_usuarios_telas UNIQUE (grupo_usuario_id, tela_id),
    CONSTRAINT fk_grupos_usuarios_telas_grupo FOREIGN KEY (grupo_usuario_id) REFERENCES grupos_usuarios(id),
    CONSTRAINT fk_grupos_usuarios_telas_tela FOREIGN KEY (tela_id) REFERENCES telas(id)
);

CREATE TABLE grupos_usuarios_controles (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    grupo_usuario_id BIGINT NOT NULL,
    controle_id BIGINT NOT NULL,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT uk_grupos_usuarios_controles UNIQUE (grupo_usuario_id, controle_id),
    CONSTRAINT fk_grupos_usuarios_controles_grupo FOREIGN KEY (grupo_usuario_id) REFERENCES grupos_usuarios(id),
    CONSTRAINT fk_grupos_usuarios_controles_controle FOREIGN KEY (controle_id) REFERENCES controles(id)
);

-- Pessoa ↔ grupo. Fica em dados_pessoais, ao lado de dados_pessoais_perfis:
-- é o id que o sistema usa como "usuário" (criado_por, Envers, JWT).
-- CASCADE do lado da pessoa para não travar exclusões que já existem hoje.
CREATE TABLE dados_pessoais_grupos_usuarios (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    dados_pessoais_id BIGINT NOT NULL,
    grupo_usuario_id BIGINT NOT NULL,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT uk_dados_pessoais_grupos_usuarios UNIQUE (dados_pessoais_id, grupo_usuario_id),
    CONSTRAINT fk_dados_pessoais_grupos_usuarios_pessoa FOREIGN KEY (dados_pessoais_id)
        REFERENCES dados_pessoais(id) ON DELETE CASCADE,
    CONSTRAINT fk_dados_pessoais_grupos_usuarios_grupo FOREIGN KEY (grupo_usuario_id)
        REFERENCES grupos_usuarios(id)
);

-- A UK acima já indexa por pessoa (cálculo da permissão); a tela de grupos
-- lista membros por grupo.
CREATE INDEX idx_dados_pessoais_grupos_usuarios_grupo ON dados_pessoais_grupos_usuarios(grupo_usuario_id);

-- ── Auditoria (Envers) ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grupos_usuarios_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    perfil_id BIGINT,
    nome VARCHAR(100),
    descricao VARCHAR(255),
    padrao BOOLEAN,
    ativo BOOLEAN,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_grupos_usuarios_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS grupos_usuarios_telas_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    grupo_usuario_id BIGINT,
    tela_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_grupos_usuarios_telas_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS grupos_usuarios_controles_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    grupo_usuario_id BIGINT,
    controle_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_grupos_usuarios_controles_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE IF NOT EXISTS dados_pessoais_grupos_usuarios_AUD (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT,
    grupo_usuario_id BIGINT,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ,
    atualizado_por BIGINT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_dados_pessoais_grupos_usuarios_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

-- ── Seed: telas ───────────────────────────────────────────────────────────
-- Gerado do routesConfig.tsx (64 rotas). Ficam de fora as rotas livres, que
-- são guardadas só por perfil (/, /perfil, /admin), e as entradas sem página
-- (/usuarios, /configuracoes, /ficha-medica/cadastro, /dashAluno/inicio).

INSERT INTO telas (codigo, nome, rota, exibir_menu, criado_em) VALUES
    -- Cadastros: hoje só ADMIN e DIRETOR (que usa as telas do ADMIN).
    ('PROFESSOR_LISTA',             'Professores',                     '/professor/lista',             TRUE,  NOW()),
    ('PROFESSOR_CADASTRO',          'Cadastro de professor',           '/professor/cadastro',          FALSE, NOW()),
    ('ALUNO_LISTA',                 'Alunos',                          '/aluno/lista',                 TRUE,  NOW()),
    ('TURMA_LISTA',                 'Turmas',                          '/turma/lista',                 TRUE,  NOW()),
    ('TURMA_CADASTRO',              'Cadastro de turma',               '/turma/cadastro',              FALSE, NOW()),
    ('TURMA_VINCULAR_ALUNOS',       'Vincular alunos à turma',         '/turma/vincular-alunos',       FALSE, NOW()),
    ('TURMA_DEFINIR_HORARIOS',      'Definir horários da turma',       '/turma/definir-horarios',      FALSE, NOW()),
    ('GRADE_CURRICULAR_LISTA',      'Grades curriculares',             '/grade-curricular/lista',      TRUE,  NOW()),
    ('GRADE_CURRICULAR_CADASTRO',   'Cadastro de grade curricular',    '/grade-curricular/cadastro',   FALSE, NOW()),
    ('GRUPO_DISCIPLINA_LISTA',      'Grupos de disciplina',            '/grupo-disciplina/lista',      TRUE,  NOW()),
    ('GRUPO_DISCIPLINA_CADASTRO',   'Cadastro de grupo de disciplina', '/grupo-disciplina/cadastro',   FALSE, NOW()),
    ('DISCIPLINA_LISTA',            'Disciplinas',                     '/disciplina/lista',            TRUE,  NOW()),
    ('DISCIPLINA_CADASTRO',         'Cadastro de disciplina',          '/disciplina/cadastro',         FALSE, NOW()),
    ('SERIE_LISTA',                 'Séries',                          '/serie/lista',                 TRUE,  NOW()),
    ('SERIE_CADASTRO',              'Cadastro de série',               '/serie/cadastro',              FALSE, NOW()),
    ('AULA_LISTA',                  'Aulas',                           '/aula/lista',                  TRUE,  NOW()),
    ('HORARIO_LISTA',               'Horários',                        '/horario/lista',               TRUE,  NOW()),
    ('HORARIO_CADASTRO',            'Cadastro de horário',             '/horario/cadastro',            FALSE, NOW()),
    ('NOTA_LISTA',                  'Notas',                           '/notas/lista',                 TRUE,  NOW()),
    ('NOTA_CADASTRO',               'Lançamento de nota',              '/notas/cadastro',              FALSE, NOW()),
    ('TAREFA_LISTA',                'Tarefas',                         '/tarefa/lista',                TRUE,  NOW()),
    ('TAREFA_CADASTRO',             'Cadastro de tarefa',              '/tarefa/cadastro',             FALSE, NOW()),
    ('ALERTA_LISTA',                'Alertas',                         '/alerta/lista',                TRUE,  NOW()),
    ('ALERTA_CADASTRO',             'Cadastro de alerta',              '/alerta/cadastro',             FALSE, NOW()),
    ('FICHA_MEDICA_LISTA',          'Fichas médicas',                  '/ficha-medica/lista',          TRUE,  NOW()),
    ('PLANEJAMENTO_ANUAL_LISTA',    'Planejamentos anuais',            '/planejamento-anual/lista',    TRUE,  NOW()),
    ('PLANEJAMENTO_ANUAL_CADASTRO', 'Cadastro de planejamento anual',  '/planejamento-anual/cadastro', FALSE, NOW()),
    ('UNIDADE_LISTA',               'Unidades',                        '/unidade/lista',               TRUE,  NOW()),
    ('UNIDADE_CADASTRO',            'Cadastro de unidade',             '/unidade/cadastro',            FALSE, NOW()),
    -- Aluno
    ('ALUNO_CADASTRO',              'Cadastro de aluno',               '/aluno/cadastro',              FALSE, NOW()),
    ('ALUNO_DETALHE',               'Detalhe do aluno',                '/aluno/detalhe',               FALSE, NOW()),
    -- Professor
    ('MINHAS_TURMAS',               'Minhas turmas',                   '/minhas-turmas',               TRUE,  NOW()),
    ('MINHAS_TURMAS_DETALHE',       'Detalhe da turma (professor)',    '/minhas-turmas/detalhe',       FALSE, NOW()),
    ('AULAS_DETALHE',               'Detalhe da aula',                 '/aulas/aula',                  FALSE, NOW()),
    ('AULA_CADASTRO',               'Cadastro de aula',                '/aula/cadastro',               FALSE, NOW()),
    ('AVALIACOES',                  'Avaliações',                      '/avaliacoes',                  TRUE,  NOW()),
    ('AVALIACAO_DETALHE',           'Detalhe da avaliação',            '/avaliacao/detalhe',           FALSE, NOW()),
    ('AVALIACAO_TURMA_NOTAS',       'Notas da avaliação por turma',    '/avaliacao/turma/notas',       FALSE, NOW()),
    ('DIARIO',                      'Diário',                          '/diario',                      TRUE,  NOW()),
    ('CONTRACHEQUE',                'Contracheque e declarações',      '/contracheque',                TRUE,  NOW()),
    -- Estudante
    ('ALUNO_AULA',                  'Aula (visão do aluno)',           '/aluno/aula',                  FALSE, NOW()),
    -- Responsável
    ('OCORRENCIAS',                 'Ocorrências',                     '/ocorrencias',                 TRUE,  NOW()),
    ('FICHA_MEDICA_RESPONSAVEL',    'Ficha médica (responsável)',      '/responsavel/ficha-medica',    TRUE,  NOW()),
    ('DOCUMENTOS_RESPONSAVEL',      'Documentos (responsável)',        '/responsavel/documentos',      TRUE,  NOW()),
    ('FINANCEIRO',                  'Financeiro',                      '/financeiro',                  TRUE,  NOW()),
    -- Secretaria
    ('SECRETARIA_MATRICULAS',       'Matrículas',                      '/secretaria/matriculas',       TRUE,  NOW()),
    ('SECRETARIA_CRM',              'CRM de matrículas',               '/secretaria/crm',              TRUE,  NOW()),
    ('SECRETARIA_DOCUMENTOS',       'Documentos de matrícula',         '/secretaria/documentos',       TRUE,  NOW()),
    ('SECRETARIA_ENTURMACAO',       'Enturmação',                      '/secretaria/enturmacao',       TRUE,  NOW()),
    ('SECRETARIA_TURMA_GERENCIAR',  'Gerenciar alunos da turma',       '/secretaria/turmas',           FALSE, NOW()),
    -- Orientação
    ('ORIENTACAO_ALUNOS',           'Alunos (orientação)',             '/orientacao/alunos',           TRUE,  NOW()),
    -- Compartilhadas entre perfis
    ('CALENDARIO',                  'Calendário',                      '/calendario',                  TRUE,  NOW()),
    ('COMUNICADOS',                 'Comunicados',                     '/comunicados',                 TRUE,  NOW()),
    ('COMUNICADOS_CADASTRO',        'Publicar comunicado',             '/comunicados/cadastro',        FALSE, NOW()),
    ('COMUNICACAO',                 'Fale conosco',                    '/comunicacao',                 TRUE,  NOW()),
    ('MATERIAIS_COMPLEMENTARES',    'Materiais complementares',        '/materiais-complementares',    TRUE,  NOW()),
    ('RELATORIOS',                  'Relatórios',                      '/relatorios',                  TRUE,  NOW());

-- Teto por perfil = o "roles" de cada rota no routesConfig.

-- DIRETOR recebe o mesmo teto do ADMIN: desde f2c7c91 o front já mostra a ele
-- as telas do ADMIN. Quando o diretor ganhar área própria, o teto dele muda
-- por migration.
INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome IN ('ADMIN', 'DIRETOR') AND t.codigo IN (
    'PROFESSOR_LISTA', 'PROFESSOR_CADASTRO', 'ALUNO_LISTA', 'TURMA_LISTA', 'TURMA_CADASTRO',
    'TURMA_VINCULAR_ALUNOS', 'TURMA_DEFINIR_HORARIOS', 'GRADE_CURRICULAR_LISTA',
    'GRADE_CURRICULAR_CADASTRO', 'GRUPO_DISCIPLINA_LISTA', 'GRUPO_DISCIPLINA_CADASTRO',
    'DISCIPLINA_LISTA', 'DISCIPLINA_CADASTRO', 'SERIE_LISTA', 'SERIE_CADASTRO', 'AULA_LISTA',
    'HORARIO_LISTA', 'HORARIO_CADASTRO', 'NOTA_LISTA', 'NOTA_CADASTRO', 'TAREFA_LISTA',
    'TAREFA_CADASTRO', 'ALERTA_LISTA', 'ALERTA_CADASTRO', 'FICHA_MEDICA_LISTA',
    'PLANEJAMENTO_ANUAL_LISTA', 'PLANEJAMENTO_ANUAL_CADASTRO', 'UNIDADE_LISTA', 'UNIDADE_CADASTRO',
    'ALUNO_CADASTRO', 'ALUNO_DETALHE', 'AULAS_DETALHE', 'AULA_CADASTRO', 'AVALIACOES',
    'AVALIACAO_DETALHE', 'AVALIACAO_TURMA_NOTAS', 'DIARIO', 'COMUNICADOS', 'COMUNICADOS_CADASTRO',
    'COMUNICACAO', 'RELATORIOS');

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'PROFESSOR' AND t.codigo IN (
    'ALUNO_DETALHE', 'MINHAS_TURMAS', 'MINHAS_TURMAS_DETALHE', 'AULAS_DETALHE', 'AULA_CADASTRO',
    'AVALIACOES', 'AVALIACAO_DETALHE', 'AVALIACAO_TURMA_NOTAS', 'DIARIO', 'CONTRACHEQUE',
    'CALENDARIO', 'COMUNICADOS', 'COMUNICACAO', 'MATERIAIS_COMPLEMENTARES');

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'SECRETARIO' AND t.codigo IN (
    'ALUNO_CADASTRO', 'ALUNO_DETALHE', 'SECRETARIA_MATRICULAS', 'SECRETARIA_CRM',
    'SECRETARIA_DOCUMENTOS', 'SECRETARIA_ENTURMACAO', 'SECRETARIA_TURMA_GERENCIAR',
    'CALENDARIO', 'COMUNICADOS', 'COMUNICADOS_CADASTRO', 'COMUNICACAO');

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'ORIENTADOR' AND t.codigo IN (
    'ALUNO_DETALHE', 'ORIENTACAO_ALUNOS', 'CALENDARIO', 'COMUNICADOS', 'COMUNICADOS_CADASTRO',
    'COMUNICACAO');

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'ESTUDANTE' AND t.codigo IN (
    'ALUNO_AULA', 'CALENDARIO', 'COMUNICADOS', 'COMUNICACAO', 'MATERIAIS_COMPLEMENTARES',
    'RELATORIOS');

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'RESPONSAVEL' AND t.codigo IN (
    'OCORRENCIAS', 'FICHA_MEDICA_RESPONSAVEL', 'DOCUMENTOS_RESPONSAVEL', 'FINANCEIRO',
    'CALENDARIO', 'COMUNICADOS', 'COMUNICACAO', 'MATERIAIS_COMPLEMENTARES', 'RELATORIOS');

-- ── Seed: controles ───────────────────────────────────────────────────────
-- Só o que já diferencia perfis dentro de uma mesma tela hoje: constantes do
-- detalhe do aluno, capacidades usadas do usePermissoes e as ações que o front
-- libera só para o ADMIN (e para o DIRETOR, que usa as telas dele). Situação
-- familiar e atendimento psicológico ficam fora do teto do ADMIN: hoje são
-- exclusivos da orientação.

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em) VALUES
    (NULL, 'ALUNO.DADOS_PESSOAIS.VER', 'Ver dados pessoais do aluno',
     'CPF, RG, nascimento, naturalidade, e-mails, endereço, responsáveis e desmatrícula, em qualquer tela.', NOW());

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'FICHA_MEDICA.VER', 'Ver ficha médica',
       'Aba e resumo da ficha médica no detalhe do aluno.', NOW()
FROM telas WHERE codigo = 'ALUNO_DETALHE';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'FICHA_MEDICA.EDITAR', 'Editar ficha médica',
       'Editar a ficha, anexar e remover laudos, incluir e alterar medicações.', NOW()
FROM telas WHERE codigo = 'ALUNO_DETALHE';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'SITUACAO_FAMILIAR.VER', 'Ver situação familiar',
       'Aba de acompanhamento socioemocional.', NOW()
FROM telas WHERE codigo = 'ALUNO_DETALHE';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'SITUACAO_FAMILIAR.EDITAR', 'Editar situação familiar', NULL, NOW()
FROM telas WHERE codigo = 'ALUNO_DETALHE';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'ATENDIMENTO_PSICOLOGICO.VER', 'Ver atendimentos psicológicos', NULL, NOW()
FROM telas WHERE codigo = 'ALUNO_DETALHE';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'ATENDIMENTO_PSICOLOGICO.REGISTRAR', 'Registrar atendimento psicológico',
       'Histórico clínico: só acrescenta, não edita nem apaga.', NOW()
FROM telas WHERE codigo = 'ALUNO_DETALHE';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'ALUNO.PRODUTOS.VER', 'Ver produtos e contratos do aluno', NULL, NOW()
FROM telas WHERE codigo = 'ALUNO_DETALHE';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'EVENTO.GERENCIAR', 'Criar e editar eventos', NULL, NOW()
FROM telas WHERE codigo = 'CALENDARIO';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'MATERIAL_COMPLEMENTAR.PUBLICAR', 'Publicar e remover materiais', NULL, NOW()
FROM telas WHERE codigo = 'MATERIAIS_COMPLEMENTARES';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'FICHA_MEDICA.INCLUIR', 'Incluir medicação e laudo',
       'Pelo portal, na ficha do próprio filho, sem editar a ficha inteira.', NOW()
FROM telas WHERE codigo = 'FICHA_MEDICA_RESPONSAVEL';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em) VALUES
    (NULL, 'ALUNO.EDITAR', 'Cadastrar e editar aluno',
     'Botões Novo e Editar na lista e no detalhe do aluno; levam à tela de cadastro.', NOW());

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'ALUNO.EXCLUIR', 'Excluir aluno', NULL, NOW()
FROM telas WHERE codigo = 'ALUNO_LISTA';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'ALUNO.MATRICULA.ALTERAR', 'Matricular e desmatricular',
       'Botões no detalhe do aluno. A tela de matrículas da secretaria não depende dele.', NOW()
FROM telas WHERE codigo = 'ALUNO_DETALHE';

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'COMUNICADO.GERENCIAR_TODOS', 'Gerenciar comunicados de outros autores',
       'Sem ele, quem publica edita e remove só o que publicou.', NOW()
FROM telas WHERE codigo = 'COMUNICADOS';

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE c.codigo IN ('ALUNO.DADOS_PESSOAIS.VER', 'FICHA_MEDICA.VER', 'FICHA_MEDICA.EDITAR')
  AND p.nome IN ('SECRETARIO', 'ORIENTADOR', 'ADMIN', 'DIRETOR');

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE c.codigo IN ('ALUNO.EDITAR', 'ALUNO.EXCLUIR', 'ALUNO.MATRICULA.ALTERAR',
                   'COMUNICADO.GERENCIAR_TODOS')
  AND p.nome IN ('ADMIN', 'DIRETOR');

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE c.codigo IN ('SITUACAO_FAMILIAR.VER', 'SITUACAO_FAMILIAR.EDITAR',
                   'ATENDIMENTO_PSICOLOGICO.VER', 'ATENDIMENTO_PSICOLOGICO.REGISTRAR')
  AND p.nome = 'ORIENTADOR';

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE c.codigo = 'ALUNO.PRODUTOS.VER' AND p.nome IN ('SECRETARIO', 'ADMIN', 'DIRETOR');

-- ESTUDANTE entra porque é o comportamento de hoje (usePermissoes.criarEvento);
-- o próprio código marca como provável bug. Ver "Divergências" na spec.
INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE c.codigo = 'EVENTO.GERENCIAR' AND p.nome IN ('PROFESSOR', 'SECRETARIO', 'ESTUDANTE');

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE c.codigo = 'MATERIAL_COMPLEMENTAR.PUBLICAR' AND p.nome = 'PROFESSOR';

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE c.codigo = 'FICHA_MEDICA.INCLUIR' AND p.nome = 'RESPONSAVEL';

-- ── Seed: grupos padrão e vínculos ────────────────────────────────────────
-- Sem grupo para ADMIN: ele recebe o teto do perfil direto (superusuário).

INSERT INTO grupos_usuarios (perfil_id, nome, descricao, padrao, criado_em)
SELECT p.id,
       COALESCE(CASE p.nome
                    WHEN 'ESTUDANTE'        THEN 'Estudantes'
                    WHEN 'PROFESSOR'        THEN 'Professores'
                    WHEN 'SECRETARIO'       THEN 'Secretaria'
                    WHEN 'COORDENADOR'      THEN 'Coordenação pedagógica'
                    WHEN 'DIRETOR'          THEN 'Diretoria'
                    WHEN 'ORIENTADOR'       THEN 'Orientação'
                    WHEN 'RECURSOS_HUMANOS' THEN 'Recursos humanos'
                    WHEN 'RESPONSAVEL'      THEN 'Responsáveis'
                END, p.nome) || ' (padrão)',
       'Criado na implantação com todas as pessoas do perfil e tudo o que ele acessava.',
       TRUE, NOW()
FROM perfis p
WHERE p.nome <> 'ADMIN';

-- Grupo padrão = teto do perfil = o que o perfil acessa hoje.
INSERT INTO grupos_usuarios_telas (grupo_usuario_id, tela_id, criado_em)
SELECT g.id, tp.tela_id, NOW()
FROM grupos_usuarios g
JOIN telas_perfis tp ON tp.perfil_id = g.perfil_id
WHERE g.padrao = TRUE;

INSERT INTO grupos_usuarios_controles (grupo_usuario_id, controle_id, criado_em)
SELECT g.id, cp.controle_id, NOW()
FROM grupos_usuarios g
JOIN controles_perfis cp ON cp.perfil_id = g.perfil_id
WHERE g.padrao = TRUE;

-- Cada pessoa entra no grupo padrão de cada perfil que tem.
INSERT INTO dados_pessoais_grupos_usuarios (dados_pessoais_id, grupo_usuario_id, criado_em)
SELECT dpp.dados_pessoais_id, g.id, NOW()
FROM dados_pessoais_perfis dpp
JOIN grupos_usuarios g ON g.perfil_id = dpp.perfil_id AND g.padrao = TRUE;
