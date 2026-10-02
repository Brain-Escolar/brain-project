-- Preço de serviço escolar não cabe em produtos_modalidades.valor: mensalidade
-- varia por ano letivo, série, turno e unidade, e reajusta todo ano. O contrato
-- precisa lembrar o preço com que foi vendido depois que a tabela nova entrar.
--  * produtos: ganha a classificação que o financeiro e o fiscal precisam
--  * produtos_precos: preço por dimensão e vigência (modalidade continua sendo
--    a variante vendável; o valor sai dela e passa a ter histórico)
--  * perfil FINANCEIRO: NÃO é inserido aqui — ver o porquê no fim do arquivo
--  * nota sobre o cadastro do pagador: a V98 afrouxou o cadastro mínimo para o
--    CRM, então endereço pode estar nulo — a V2 (boleto) vai precisar disso

ALTER TABLE produtos ADD COLUMN natureza VARCHAR(20);
ALTER TABLE produtos ADD COLUMN permite_bolsa BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE produtos ADD COLUMN gera_nfse BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE produtos ADD COLUMN item_lc116 VARCHAR(10);
ALTER TABLE produtos ADD COLUMN conta_contabil VARCHAR(20);

ALTER TABLE produtos_AUD ADD COLUMN natureza VARCHAR(20);
ALTER TABLE produtos_AUD ADD COLUMN permite_bolsa BOOLEAN;
ALTER TABLE produtos_AUD ADD COLUMN gera_nfse BOOLEAN;
ALTER TABLE produtos_AUD ADD COLUMN item_lc116 VARCHAR(10);
ALTER TABLE produtos_AUD ADD COLUMN conta_contabil VARCHAR(20);

-- produtos.natureza: RECORRENTE (mensalidade) | UNICO (taxa de matricula) |
--   EVENTUAL (passeio, 2a chamada)
-- produtos.permite_bolsa: Se bolsa/desconto pode incidir sobre este item. Ver
--   tambem tipos_bolsa_produtos
-- produtos.item_lc116: Item da LC 116/2003; ensino = 8.01. Usado pela NFS-e
--   (V4 do roadmap)
-- produtos.conta_contabil: Ponte para o plano de contas do DRE (V7 do
--   roadmap)

-- Produtos ja cadastrados sao itens de loja/material: nao recorrentes e sem bolsa.
UPDATE produtos SET natureza = 'EVENTUAL' WHERE natureza IS NULL;

CREATE TABLE produtos_precos (
    id BIGSERIAL PRIMARY KEY,
    produto_modalidade_id BIGINT NOT NULL,
    ano_letivo INTEGER,
    unidade_id BIGINT,
    serie_id BIGINT,
    turno VARCHAR(50),
    valor DECIMAL(10,2) NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_por BIGINT,
    -- CASCADE porque o backfill abaixo cria uma linha por modalidade existente:
    -- sem isso, apagar uma modalidade (que hoje funciona) passaria a falhar.
    CONSTRAINT fk_produtos_precos_modalidade FOREIGN KEY (produto_modalidade_id)
        REFERENCES produtos_modalidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_produtos_precos_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id),
    CONSTRAINT fk_produtos_precos_serie FOREIGN KEY (serie_id) REFERENCES series(id),
    CONSTRAINT chk_produtos_precos_valor CHECK (valor >= 0),
    CONSTRAINT chk_produtos_precos_vigencia CHECK (vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio)
);

CREATE INDEX idx_produtos_precos_busca ON produtos_precos (ano_letivo, produto_modalidade_id, vigencia_inicio DESC);

-- Unicidade da dimensao fica no servico: NULL significa "vale para qualquer",
-- e NULL nao deduplica em UNIQUE. Validar antes de inserir preco novo.

-- produtos_precos NAO tem gemea _AUD, e a entidade JPA nao deve ser @Audited.
-- Motivo: a tabela ja e temporal -- o historico de preco esta nas proprias
-- linhas (vigencia_inicio / vigencia_fim), e quem mexeu esta em atualizado_por.
-- Uma gemea _AUD aqui seria pior que inutil: como o delete vem por ON DELETE
-- CASCADE da modalidade, o Postgres apagaria as linhas sem passar pelo
-- Hibernate e a auditoria ficaria com buraco silencioso.
--
-- A disciplina que substitui a auditoria: NUNCA editar `valor` no lugar.
-- Reajuste = fechar a vigencia da linha atual e inserir outra. Mesma regra dos
-- titulos, pelo mesmo motivo -- historico que se reescreve nao e historico.

-- Traz o preco atual das modalidades para o novo caminho, sem apagar o antigo.
-- produtos_modalidades.valor fica como legado ate as telas de loja migrarem.
INSERT INTO produtos_precos (produto_modalidade_id, valor, vigencia_inicio, atualizado_em)
SELECT id, valor, CURRENT_DATE, NOW() FROM produtos_modalidades;

-- produtos_precos: Preco por dimensao e vigencia. Contrato guarda snapshot do
--   valor, nao FK viva: contrato de 2027 continua sabendo o preco de 2027
--   depois que 2028 entrar.

-- O perfil FINANCEIRO NAO e inserido aqui, de proposito.
--
-- `perfis` e espelhado por enums fechados nos dois lados: PerfilNome (Java) e
-- UserRoleEnum / PerfilNomeEnum (frontend). Uma linha que os enums nao conhecem
-- e uma bomba-relogio: no frontend, parseRoles() descarta o valor desconhecido,
-- entao quem receber so esse perfil loga sem menu, sem rota e sem permissao.
--
-- A linha deve entrar JUNTO com o codigo que a reconhece, nao antes. Quando os
-- enums forem atualizados (ver README-financeiro.md), esta migration acompanha:
--
--   INSERT INTO perfis (nome, atualizado_em)
--   SELECT 'FINANCEIRO', NOW()
--   WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'FINANCEIRO');
--
-- Ate la, alcadas_desconto aponta para os perfis que ja existem (DIRETOR,
-- SECRETARIO, COORDENADOR), que e o suficiente para a tela de matricula.

-- V98 tornou cpf/endereco opcionais em dados_pessoais para o lead do CRM entrar
-- com nome + e-mail. Boleto registrado recusa pagador sem endereco completo, e
-- a NFS-e precisa do CPF de quem paga.
--
-- A lista de cadastro incompleto e uma query do servico:
--   SELECT r.id FROM responsaveis r JOIN dados_pessoais dp ON dp.id = r.dados_pessoais_id
--    WHERE r.financeiro = TRUE AND (dp.cpf IS NULL OR dp.logradouro IS NULL
--          OR dp.numero IS NULL OR dp.bairro IS NULL OR dp.cidade IS NULL
--          OR dp.uf IS NULL OR dp.cep IS NULL);
