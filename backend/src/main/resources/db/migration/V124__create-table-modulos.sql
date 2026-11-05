-- Módulos e submódulos do menu no catálogo de permissões (docs/permissoes.md,
-- D33 e D34).
--
-- A main organizou o menu em módulos (RoutesModuleEnum) e dividiu o módulo
-- Cadastros em setores (RoutesSectionEnum). Eles entram no catálogo para a tela
-- de grupos agrupar as telas do mesmo jeito que o menu. O menu continua montado
-- pelo routesConfig (D6): esta tabela não decide o que aparece nem onde, e não
-- existe permissão por módulo.
--
-- Submódulo é um módulo com pai. Hoje são dois níveis: os módulos do menu e os
-- setores de Cadastros. O codigo é a chave do enum no frontend (RoutesModuleEnum
-- no módulo, RoutesSectionEnum no submódulo), como o codigo da tela é a chave do
-- RoutesEnum. Como as telas, pertence ao código e só muda por migration.

CREATE TABLE modulos (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    codigo VARCHAR(80) NOT NULL,
    nome VARCHAR(120) NOT NULL,
    modulo_pai_id BIGINT,
    -- Posição entre os irmãos: a do menu do diretor para os módulos, a do
    -- SECTION_CONFIG para os setores de Cadastros.
    ordem INTEGER NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    CONSTRAINT uk_modulos_codigo UNIQUE (codigo),
    CONSTRAINT fk_modulos_pai FOREIGN KEY (modulo_pai_id) REFERENCES modulos(id)
);

-- O nível mais baixo a que a tela pertence: o submódulo, quando o módulo tem
-- setores; o módulo, quando não tem. Nulo = item solto no menu, ou página
-- interna de um item solto.
ALTER TABLE telas ADD COLUMN modulo_id BIGINT;

ALTER TABLE telas ADD CONSTRAINT fk_telas_modulo FOREIGN KEY (modulo_id) REFERENCES modulos(id);

INSERT INTO modulos (codigo, nome, modulo_pai_id, ordem, criado_em) VALUES
    ('CADASTROS',          'Cadastros',          NULL, 1, NOW()),
    ('ROTINAS_ACADEMICAS', 'Rotinas Acadêmicas', NULL, 2, NOW()),
    ('GESTAO_ESCOLAR',     'Gestão Escolar',     NULL, 3, NOW()),
    ('RELATORIOS',         'Relatórios',         NULL, 4, NOW());

INSERT INTO modulos (codigo, nome, modulo_pai_id, ordem, criado_em)
SELECT 'PESSOAS', 'Pessoas', id, 1, NOW() FROM modulos WHERE codigo = 'CADASTROS';

INSERT INTO modulos (codigo, nome, modulo_pai_id, ordem, criado_em)
SELECT 'ESTRUTURA_ESCOLAR', 'Estrutura Escolar', id, 2, NOW() FROM modulos WHERE codigo = 'CADASTROS';

INSERT INTO modulos (codigo, nome, modulo_pai_id, ordem, criado_em)
SELECT 'CURRICULO', 'Currículo', id, 3, NOW() FROM modulos WHERE codigo = 'CADASTROS';

INSERT INTO modulos (codigo, nome, modulo_pai_id, ordem, criado_em)
SELECT 'PEDAGOGICO', 'Pedagógico', id, 4, NOW() FROM modulos WHERE codigo = 'CADASTROS';

-- Tela do menu: o módulo (ou setor) da entrada dela no routesConfig. Página
-- interna: o da lista de onde se chega a ela, pela mesma regra do breadcrumb
-- (findListSibling: mesmo primeiro segmento da rota), quando algum perfil tem
-- as duas. Por isso o detalhe e o cadastro do aluno ficam em Pessoas, e a aula
-- do aluno (/aluno/aula, só do estudante) fica sem módulo.

UPDATE telas SET modulo_id = (SELECT id FROM modulos WHERE codigo = 'PESSOAS')
WHERE codigo IN ('PROFESSOR_LISTA', 'PROFESSOR_CADASTRO', 'ALUNO_LISTA', 'ALUNO_CADASTRO',
                 'ALUNO_DETALHE', 'FICHA_MEDICA_LISTA');

UPDATE telas SET modulo_id = (SELECT id FROM modulos WHERE codigo = 'ESTRUTURA_ESCOLAR')
WHERE codigo IN ('TURMA_LISTA', 'TURMA_CADASTRO', 'TURMA_VINCULAR_ALUNOS', 'TURMA_DEFINIR_HORARIOS',
                 'SERIE_LISTA', 'SERIE_CADASTRO', 'HORARIO_LISTA', 'HORARIO_CADASTRO',
                 'UNIDADE_LISTA', 'UNIDADE_CADASTRO');

UPDATE telas SET modulo_id = (SELECT id FROM modulos WHERE codigo = 'CURRICULO')
WHERE codigo IN ('GRADE_CURRICULAR_LISTA', 'GRADE_CURRICULAR_CADASTRO', 'GRUPO_DISCIPLINA_LISTA',
                 'GRUPO_DISCIPLINA_CADASTRO', 'DISCIPLINA_LISTA', 'DISCIPLINA_CADASTRO',
                 'PLANEJAMENTO_ANUAL_LISTA', 'PLANEJAMENTO_ANUAL_CADASTRO');

UPDATE telas SET modulo_id = (SELECT id FROM modulos WHERE codigo = 'PEDAGOGICO')
WHERE codigo IN ('AULA_LISTA', 'AULA_CADASTRO', 'NOTA_LISTA', 'NOTA_CADASTRO',
                 'TAREFA_LISTA', 'TAREFA_CADASTRO', 'ALERTA_LISTA', 'ALERTA_CADASTRO');

-- O calendário é item solto no menu dos outros perfis e fica em Rotinas
-- Acadêmicas no do diretor. O módulo é um só por tela, e vale o do menu que
-- tem módulo.
UPDATE telas SET modulo_id = (SELECT id FROM modulos WHERE codigo = 'ROTINAS_ACADEMICAS')
WHERE codigo = 'CALENDARIO';
