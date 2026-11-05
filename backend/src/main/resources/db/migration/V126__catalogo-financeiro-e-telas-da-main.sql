-- Catálogo depois do merge da main de 04/11/2026 (docs/permissoes.md, D37–D40).
--
-- 1. Telas novas da main: catálogo e preços, aprovação de bolsa e aprovação de
--    preço. A de bolsa também é de DIRETOR e ADMIN, como a de preço (D40). Na
--    main ela é só de SECRETARIO e FINANCEIRO, embora a V118 diga que a direção
--    abre a fila.
-- 2. Perfil FINANCEIRO (V119): grupo padrão, teto e as pessoas que já têm o
--    perfil. Sem isso ele entra no sistema e não vê nada (D2, D37). Além das
--    telas de dinheiro, recebe a lista e a ficha do aluno, só com dados
--    cadastrais e responsáveis (D38).
-- 3. Controle PAGAMENTO.ESTORNAR, só no teto do FINANCEIRO: a secretaria abre o
--    financeiro, mas não estorna (D39).
--
-- Como no seed da V121, nada disto gera revisão no Envers.

-- ── 1. Telas novas ──────────────────────────────────────────────────────────

-- Sem modulo_id: no routesConfig as três são itens soltos do menu.
INSERT INTO telas (codigo, nome, rota, exibir_menu, criado_em) VALUES
    ('SECRETARIA_CATALOGO',        'Catálogo e preços',  '/secretaria/catalogo',        TRUE, NOW()),
    ('SECRETARIA_APROVACAO_BOLSA', 'Aprovação de bolsa', '/secretaria/aprovacao-bolsa', TRUE, NOW()),
    ('SECRETARIA_APROVACAO_PRECO', 'Aprovação de preço', '/secretaria/aprovacao-preco', TRUE, NOW());

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE (t.codigo = 'SECRETARIA_CATALOGO'        AND p.nome IN ('SECRETARIO', 'FINANCEIRO'))
   OR (t.codigo = 'SECRETARIA_APROVACAO_BOLSA' AND p.nome IN ('SECRETARIO', 'FINANCEIRO', 'DIRETOR', 'ADMIN'))
   OR (t.codigo = 'SECRETARIA_APROVACAO_PRECO' AND p.nome IN ('FINANCEIRO', 'DIRETOR', 'ADMIN'));

-- Só os grupos padrão recebem tela nova; os personalizados foram restringidos
-- de propósito (seção 10).
INSERT INTO grupos_usuarios_telas (grupo_usuario_id, tela_id, criado_em)
SELECT g.id, tp.tela_id, NOW()
FROM grupos_usuarios g
JOIN telas_perfis tp ON tp.perfil_id = g.perfil_id
JOIN telas t ON t.id = tp.tela_id
WHERE g.padrao = TRUE
  AND t.codigo IN ('SECRETARIA_CATALOGO', 'SECRETARIA_APROVACAO_BOLSA', 'SECRETARIA_APROVACAO_PRECO');

-- ── 2. Perfil FINANCEIRO ────────────────────────────────────────────────────

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE p.nome = 'FINANCEIRO' AND t.codigo IN ('SECRETARIA_FINANCEIRO', 'ALUNO_LISTA', 'ALUNO_DETALHE');

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE p.nome = 'FINANCEIRO' AND c.codigo = 'ALUNO.DADOS_PESSOAIS.VER';

-- ── 3. Estorno ──────────────────────────────────────────────────────────────

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT id, 'PAGAMENTO.ESTORNAR', 'Estornar pagamento',
       'Botão Estornar no carnê do aluno. Tira dinheiro de um caixa que pode já estar fechado.', NOW()
FROM telas WHERE codigo = 'SECRETARIA_FINANCEIRO';

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE p.nome = 'FINANCEIRO' AND c.codigo = 'PAGAMENTO.ESTORNAR';

-- ── Grupo padrão do FINANCEIRO ──────────────────────────────────────────────

-- O grupo pode já existir. A V121 cria um grupo padrão para cada linha de
-- perfis: quem aplica as migrations em ordem chega nela com o FINANCEIRO da V119
-- e ganha o grupo vazio e com o nome cru. Só não existe em banco que rodou a
-- permissões antes de a main criar o perfil (seção 7.3).
INSERT INTO grupos_usuarios (perfil_id, nome, descricao, padrao, criado_em)
SELECT p.id, 'Financeiro (padrão)',
       'Criado na implantação com todas as pessoas do perfil e tudo o que ele acessava.',
       TRUE, NOW()
FROM perfis p
WHERE p.nome = 'FINANCEIRO'
  AND NOT EXISTS (SELECT 1 FROM grupos_usuarios g WHERE g.perfil_id = p.id AND g.padrao = TRUE);

UPDATE grupos_usuarios SET nome = 'Financeiro (padrão)'
WHERE padrao = TRUE AND perfil_id = (SELECT id FROM perfis WHERE nome = 'FINANCEIRO');

-- Grupo padrão = teto do perfil. As três telas novas já entraram acima.
INSERT INTO grupos_usuarios_telas (grupo_usuario_id, tela_id, criado_em)
SELECT g.id, tp.tela_id, NOW()
FROM grupos_usuarios g
JOIN perfis p ON p.id = g.perfil_id
JOIN telas_perfis tp ON tp.perfil_id = g.perfil_id
WHERE g.padrao = TRUE AND p.nome = 'FINANCEIRO'
  AND NOT EXISTS (SELECT 1 FROM grupos_usuarios_telas gt
                  WHERE gt.grupo_usuario_id = g.id AND gt.tela_id = tp.tela_id);

INSERT INTO grupos_usuarios_controles (grupo_usuario_id, controle_id, criado_em)
SELECT g.id, cp.controle_id, NOW()
FROM grupos_usuarios g
JOIN perfis p ON p.id = g.perfil_id
JOIN controles_perfis cp ON cp.perfil_id = g.perfil_id
WHERE g.padrao = TRUE AND p.nome = 'FINANCEIRO'
  AND NOT EXISTS (SELECT 1 FROM grupos_usuarios_controles gc
                  WHERE gc.grupo_usuario_id = g.id AND gc.controle_id = cp.controle_id);

-- Quem já tem o perfil entra no grupo, como no seed da V121.
INSERT INTO dados_pessoais_grupos_usuarios (dados_pessoais_id, grupo_usuario_id, criado_em)
SELECT dpp.dados_pessoais_id, g.id, NOW()
FROM dados_pessoais_perfis dpp
JOIN perfis p ON p.id = dpp.perfil_id
JOIN grupos_usuarios g ON g.perfil_id = dpp.perfil_id AND g.padrao = TRUE
WHERE p.nome = 'FINANCEIRO'
  AND NOT EXISTS (SELECT 1 FROM dados_pessoais_grupos_usuarios m
                  WHERE m.dados_pessoais_id = dpp.dados_pessoais_id AND m.grupo_usuario_id = g.id);
