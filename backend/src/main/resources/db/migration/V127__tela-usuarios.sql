-- Tela de Usuários (/usuarios) — docs/permissoes.md, D43 a D50.
--
-- 1. Catálogo: a tela USUARIOS e os cinco controles de gestão. Teto: ADMIN e
--    DIRETOR com tudo; SECRETARIO só com a tela e o controle de login. Só o
--    grupo padrão do DIRETOR recebe os itens: o da secretaria fica sem nada,
--    e a escola libera num grupo dela se quiser (D45). É o primeiro caso em
--    que o grupo padrão não recebe todo o teto do perfil (seção 10).
-- 2. Login: motivo da desativação, token de definição de senha separado do de
--    verificação e um login por pessoa (UNIQUE em dados_pessoais_id).
-- 3. Auditoria: perfis da pessoa passam pelo Envers (dados_pessoais_perfis_AUD)
--    e os tokens do Google no _AUD viram TEXT, como na tabela (V51).
--
-- Como no seed da V121, o catálogo não gera revisão no Envers.

-- ── 1. Catálogo ─────────────────────────────────────────────────────────────

-- Sem modulo_id: no routesConfig, Usuários é um item solto do menu.
INSERT INTO telas (codigo, nome, rota, exibir_menu, criado_em) VALUES
    ('USUARIOS', 'Usuários', '/usuarios', TRUE, NOW());

INSERT INTO telas_perfis (tela_id, perfil_id)
SELECT t.id, p.id FROM telas t, perfis p
WHERE t.codigo = 'USUARIOS' AND p.nome IN ('ADMIN', 'DIRETOR', 'SECRETARIO');

INSERT INTO controles (tela_id, codigo, nome, descricao, criado_em)
SELECT t.id, c.codigo, c.nome, c.descricao, NOW()
FROM telas t,
     (VALUES
         ('USUARIO.LOGIN.GERENCIAR', 'Gerenciar login',
          'Desativar e reativar o login, reenviar a verificação e enviar a redefinição de senha.'),
         ('USUARIO.ACESSOS.VER', 'Ver acessos da pessoa',
          'Grupos da pessoa e o que ela abre em cada perfil, só leitura.'),
         ('USUARIO.GRUPOS.GERENCIAR', 'Gerenciar grupos da pessoa',
          'Pôr a pessoa num grupo e tirá-la dele, a partir da página dela.'),
         ('USUARIO.PERFIS.GERENCIAR', 'Gerenciar perfis',
          'Conceder e remover os perfis de função (diretor, orientador, secretário).'),
         ('USUARIO.ACESSOS_INDIVIDUAIS.GERENCIAR', 'Gerenciar acessos individuais',
          'Editar os acessos individuais da pessoa.')
     ) AS c(codigo, nome, descricao)
WHERE t.codigo = 'USUARIOS';

INSERT INTO controles_perfis (controle_id, perfil_id)
SELECT c.id, p.id FROM controles c, perfis p
WHERE (c.codigo = 'USUARIO.LOGIN.GERENCIAR' AND p.nome IN ('ADMIN', 'DIRETOR', 'SECRETARIO'))
   OR (c.codigo IN ('USUARIO.ACESSOS.VER', 'USUARIO.GRUPOS.GERENCIAR', 'USUARIO.PERFIS.GERENCIAR',
                    'USUARIO.ACESSOS_INDIVIDUAIS.GERENCIAR')
       AND p.nome IN ('ADMIN', 'DIRETOR'));

INSERT INTO grupos_usuarios_telas (grupo_usuario_id, tela_id, criado_em)
SELECT g.id, t.id, NOW()
FROM grupos_usuarios g
JOIN perfis p ON p.id = g.perfil_id
JOIN telas t ON t.codigo = 'USUARIOS'
WHERE g.padrao = TRUE AND p.nome = 'DIRETOR';

INSERT INTO grupos_usuarios_controles (grupo_usuario_id, controle_id, criado_em)
SELECT g.id, c.id, NOW()
FROM grupos_usuarios g
JOIN perfis p ON p.id = g.perfil_id
JOIN controles c ON c.codigo LIKE 'USUARIO.%'
WHERE g.padrao = TRUE AND p.nome = 'DIRETOR';

-- ── 2. Login ────────────────────────────────────────────────────────────────

-- SEM_PERFIL: a pessoa ficou sem papel nenhum (desmatrícula, desligamento) e o
-- login volta sozinho quando ela recebe um perfil de novo. ADMINISTRATIVA: pela
-- tela de Usuários; só volta pela tela (D47).
ALTER TABLE dados_autenticacao ADD COLUMN motivo_desativacao VARCHAR(30);
ALTER TABLE dados_autenticacao_AUD ADD COLUMN motivo_desativacao VARCHAR(30);

-- Quem já está verificado e desligado só pode ter saído pelo revogarPerfil.
UPDATE dados_autenticacao SET motivo_desativacao = 'SEM_PERFIL'
WHERE verificado = TRUE AND ativo = FALSE;

-- Link de definir ou redefinir senha. A escola e o login vão num token assinado;
-- aqui fica só o código de uso único, que se apaga quando a senha é trocada.
-- O token antigo (token, expiracao_token) fica só para o link de verificação.
ALTER TABLE dados_autenticacao ADD COLUMN token_senha VARCHAR(64);
ALTER TABLE dados_autenticacao ADD COLUMN expiracao_token_senha TIMESTAMP;
ALTER TABLE dados_autenticacao_AUD ADD COLUMN token_senha VARCHAR(64);
ALTER TABLE dados_autenticacao_AUD ADD COLUMN expiracao_token_senha TIMESTAMP;

-- Uma linha por pessoa com login. Se houver duplicata, a migration para aqui com
-- o dados_pessoais_id repetido na mensagem do banco: não há regra segura para
-- escolher qual login fica, então a decisão é de quem opera a escola.
ALTER TABLE dados_autenticacao
    ADD CONSTRAINT uk_dados_autenticacao_dados_pessoais UNIQUE (dados_pessoais_id);

-- ── 3. Auditoria ────────────────────────────────────────────────────────────

ALTER TABLE dados_autenticacao_AUD ALTER COLUMN google_access_token TYPE TEXT;
ALTER TABLE dados_autenticacao_AUD ALTER COLUMN google_refresh_token TYPE TEXT;

-- Coleção do DadosPessoais.perfis, agora auditada (F6).
CREATE TABLE IF NOT EXISTS dados_pessoais_perfis_AUD (
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    dados_pessoais_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,
    PRIMARY KEY (rev, dados_pessoais_id, perfil_id),
    CONSTRAINT fk_dados_pessoais_perfis_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
