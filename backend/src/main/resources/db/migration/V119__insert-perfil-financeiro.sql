-- O perfil FINANCEIRO, finalmente.
--
-- A V100 deixou esta linha de fora de proposito, e explicou o porque no fim do
-- arquivo: `perfis` e espelhada por enums fechados nos dois lados -- PerfilNome
-- no Java (@Enumerated(EnumType.STRING), e Perfil implements GrantedAuthority) e
-- UserRoleEnum/PerfilNomeEnum no frontend. Uma linha que os enums nao conhecem
-- estoura excecao na leitura do backend e desaparece no parseRoles() do
-- frontend: a pessoa loga e fica sem menu, sem rota e sem permissao nenhuma.
--
-- Agora o codigo que a reconhece existe -- PerfilNome, os dois enums do
-- frontend, PERFIL_DISPLAY_NAME, PRECEDENCIA_PERFIL, getDefaultRoute (nos dois
-- lugares) e routesConfig -- entao a linha pode entrar.
--
-- Idempotente porque migration que roda em 20 schemas de tenant nao pode
-- depender de nenhum deles estar num estado especifico.
INSERT INTO perfis (nome, atualizado_em)
SELECT 'FINANCEIRO', NOW()
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'FINANCEIRO');

-- A alcada de desconto podia apontar para DIRETOR, SECRETARIO e COORDENADOR
-- so porque FINANCEIRO nao existia. Nenhuma alcada existente e alterada aqui:
-- quem decide quanto a escola deixa de arrecadar e decisao da direcao, nao
-- consequencia de uma migration.
