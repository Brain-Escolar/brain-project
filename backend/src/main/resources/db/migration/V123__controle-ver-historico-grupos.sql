-- Histórico do grupo de usuários (docs/permissoes.md, seção 10).
--
-- Controle sem tela: a tela de grupos é guardada por perfil (ADMIN e DIRETOR
-- no SecurityConfigurations), não está no catálogo. O teto é dos mesmos dois
-- perfis; o ADMIN recebe o teto direto, e o grupo padrão da diretoria ganha o
-- controle para continuar igual ao teto do perfil. Os demais grupos de DIRETOR
-- só o recebem pela tela.

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em) VALUES
    (NULL, 'GRUPO_USUARIO.HISTORICO.VER', 'Ver histórico dos grupos',
     'Botão Histórico no detalhe do grupo: quem mudou nome, acessos e pessoas, e quando.', NOW());

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE c.codigo = 'GRUPO_USUARIO.HISTORICO.VER' AND p.nome IN ('ADMIN', 'DIRETOR');

INSERT INTO grupos_usuarios_controles (grupo_usuario_id, controle_id, criado_em)
SELECT g.id, c.id, NOW()
FROM grupos_usuarios g
JOIN perfis p ON p.id = g.perfil_id
JOIN controles c ON c.codigo = 'GRUPO_USUARIO.HISTORICO.VER'
WHERE g.padrao = TRUE AND p.nome = 'DIRETOR';
