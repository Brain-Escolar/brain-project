-- Catálogo depois do merge da main de 29/10/2026 (docs/permissoes.md, D35).
--
-- 1. Telas novas da main, cada uma com o módulo do menu, o teto que o
--    routesConfig dá e a concessão aos grupos padrão (seção 10): cadastro de
--    secretários (ADMIN e DIRETOR), a área da Direção (só DIRETOR; como na
--    main, o ADMIN não a recebe) e o financeiro da escola (SECRETARIO). Sem
--    elas, essas páginas sumiriam para todo mundo.
-- 2. DIRETOR: a main deu a ele área própria, e a herança das telas do ADMIN
--    (D8, D14) acabou. O teto passa a ser o que a main mostra a ele. Ganha o
--    calendário, onde cria eventos institucionais. Perde Avaliações, Diário e
--    os Relatórios do admin. No detalhe do aluno, vê a ficha médica sem
--    editar, não vê produtos e não matricula nem desmatricula.
--
-- O que sai do teto sai também dos grupos normais de DIRETOR: o cálculo já
-- ignoraria, mas a aba "Por tela" mostra a concessão como está gravada. O
-- acesso individual não tem teto (D22) e fica como está. Como no seed da
-- V117, nada disto gera revisão no Envers.

-- ── 1. Telas novas ──────────────────────────────────────────────────────────

INSERT INTO telas (codigo, nome, rota, exibir_menu, criado_em) VALUES
    ('SECRETARIO_LISTA',               'Secretários',                  '/secretario/lista',                   TRUE,  NOW()),
    ('SECRETARIO_CADASTRO',            'Cadastro de secretário',       '/secretario/cadastro',                FALSE, NOW()),
    ('GESTAO_PROFESSORES',             'Professores (gestão escolar)', '/gestao-escolar/professores',         TRUE,  NOW()),
    ('GESTAO_PROFESSOR_DETALHE',       'Acompanhamento do professor',  '/gestao-escolar/professores/detalhe', FALSE, NOW()),
    ('GESTAO_ANO_LETIVO',              'Ano letivo',                   '/gestao-escolar/ano-letivo',          TRUE,  NOW()),
    ('RELATORIO_ACOMPANHAMENTO_TURMA', 'Acompanhamento por turma',     '/relatorios/acompanhamento-turma',    TRUE,  NOW()),
    ('SECRETARIA_FINANCEIRO',          'Financeiro da escola',         '/secretaria/financeiro',              TRUE,  NOW());

UPDATE telas SET modulo_id = (SELECT id FROM modulos WHERE codigo = 'PESSOAS')
WHERE codigo IN ('SECRETARIO_LISTA', 'SECRETARIO_CADASTRO');

UPDATE telas SET modulo_id = (SELECT id FROM modulos WHERE codigo = 'GESTAO_ESCOLAR')
WHERE codigo IN ('GESTAO_PROFESSORES', 'GESTAO_PROFESSOR_DETALHE', 'GESTAO_ANO_LETIVO');

UPDATE telas SET modulo_id = (SELECT id FROM modulos WHERE codigo = 'RELATORIOS')
WHERE codigo = 'RELATORIO_ACOMPANHAMENTO_TURMA';

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome IN ('ADMIN', 'DIRETOR') AND t.codigo IN ('SECRETARIO_LISTA', 'SECRETARIO_CADASTRO');

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'DIRETOR' AND t.codigo IN (
    'GESTAO_PROFESSORES', 'GESTAO_PROFESSOR_DETALHE', 'GESTAO_ANO_LETIVO',
    'RELATORIO_ACOMPANHAMENTO_TURMA');

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'SECRETARIO' AND t.codigo = 'SECRETARIA_FINANCEIRO';

-- Só os grupos padrão recebem tela nova; os personalizados foram restringidos
-- de propósito (seção 10).
INSERT INTO grupos_usuarios_telas (grupo_usuario_id, tela_id, criado_em)
SELECT g.id, tp.tela_id, NOW()
FROM grupos_usuarios g
JOIN telas_perfis tp ON tp.perfil_id = g.perfil_id
JOIN telas t ON t.id = tp.tela_id
WHERE g.padrao = TRUE AND t.codigo IN (
    'SECRETARIO_LISTA', 'SECRETARIO_CADASTRO', 'GESTAO_PROFESSORES', 'GESTAO_PROFESSOR_DETALHE',
    'GESTAO_ANO_LETIVO', 'RELATORIO_ACOMPANHAMENTO_TURMA', 'SECRETARIA_FINANCEIRO');

-- ── 2. Teto do DIRETOR ──────────────────────────────────────────────────────

-- O calendário já existia para os outros perfis; aqui ele entra só no teto e
-- no grupo padrão do DIRETOR, junto com o controle de criar eventos.
INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'DIRETOR' AND t.codigo = 'CALENDARIO';

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE p.nome = 'DIRETOR' AND c.codigo = 'EVENTO.GERENCIAR';

INSERT INTO grupos_usuarios_telas (grupo_usuario_id, tela_id, criado_em)
SELECT g.id, t.id, NOW()
FROM grupos_usuarios g
JOIN perfis p ON p.id = g.perfil_id
JOIN telas t ON t.codigo = 'CALENDARIO'
WHERE g.padrao = TRUE AND p.nome = 'DIRETOR';

INSERT INTO grupos_usuarios_controles (grupo_usuario_id, controle_id, criado_em)
SELECT g.id, c.id, NOW()
FROM grupos_usuarios g
JOIN perfis p ON p.id = g.perfil_id
JOIN controles c ON c.codigo = 'EVENTO.GERENCIAR'
WHERE g.padrao = TRUE AND p.nome = 'DIRETOR';

-- O que sai: primeiro dos grupos normais, depois do teto.
DELETE FROM grupos_usuarios_telas
WHERE tela_id IN (SELECT id FROM telas WHERE codigo IN (
          'AVALIACOES', 'AVALIACAO_DETALHE', 'AVALIACAO_TURMA_NOTAS', 'DIARIO', 'RELATORIOS'))
  AND grupo_usuario_id IN (
          SELECT g.id FROM grupos_usuarios g JOIN perfis p ON p.id = g.perfil_id
          WHERE p.nome = 'DIRETOR' AND g.dados_pessoais_id IS NULL);

DELETE FROM telas_perfis
WHERE perfil_id = (SELECT id FROM perfis WHERE nome = 'DIRETOR')
  AND tela_id IN (SELECT id FROM telas WHERE codigo IN (
          'AVALIACOES', 'AVALIACAO_DETALHE', 'AVALIACAO_TURMA_NOTAS', 'DIARIO', 'RELATORIOS'));

DELETE FROM grupos_usuarios_controles
WHERE controle_id IN (SELECT id FROM controles WHERE codigo IN (
          'FICHA_MEDICA.EDITAR', 'ALUNO.PRODUTOS.VER', 'ALUNO.MATRICULA.ALTERAR'))
  AND grupo_usuario_id IN (
          SELECT g.id FROM grupos_usuarios g JOIN perfis p ON p.id = g.perfil_id
          WHERE p.nome = 'DIRETOR' AND g.dados_pessoais_id IS NULL);

DELETE FROM controles_perfis
WHERE perfil_id = (SELECT id FROM perfis WHERE nome = 'DIRETOR')
  AND controle_id IN (SELECT id FROM controles WHERE codigo IN (
          'FICHA_MEDICA.EDITAR', 'ALUNO.PRODUTOS.VER', 'ALUNO.MATRICULA.ALTERAR'));
