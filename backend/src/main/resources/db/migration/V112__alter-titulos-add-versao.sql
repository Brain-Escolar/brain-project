-- Conserta uma trava que impede o unico caminho de corrigir um titulo.
--
-- A V101 criou uq_titulos_parcela (contrato_id, numero_parcela, responsavel_id)
-- e, na mesma entrega, Titulo.substituindo(), que emite o titulo novo COPIANDO
-- contrato, numero_parcela e responsavel do antigo. As duas coisas nao cabem
-- juntas: a substituicao estoura o indice unico. Ou seja -- estorno com
-- reemissao e renegociacao estao ambos impossiveis hoje, e sao exatamente as
-- duas operacoes que existem para consertar uma parcela errada.
--
-- Tirar o indice resolveria e abriria outro buraco: duas emissoes do mesmo carne
-- cobrariam a familia em dobro, sem nada reclamar. Entao o indice fica e ganha
-- `versao` na chave: uma linha por versao da parcela, e a cadeia fica legivel --
-- v1 estornada, v2 vigente, cada uma apontando para a anterior em
-- titulo_origem_id.
--
-- Indice parcial (UNIQUE ... WHERE status = 'ABERTO') resolveria tambem e nao
-- roda no H2 dos testes, mesma razao da V101. "So uma versao aberta por parcela"
-- continua sendo regra de servico.

ALTER TABLE titulos ADD COLUMN versao INTEGER NOT NULL DEFAULT 1;
ALTER TABLE titulos_AUD ADD COLUMN versao INTEGER;

DROP INDEX uq_titulos_parcela;
CREATE UNIQUE INDEX uq_titulos_parcela
    ON titulos (contrato_id, numero_parcela, responsavel_id, versao);

-- Versao cresce de 1 em 1 e nunca volta. Sem CHECK contra a versao do titulo de
-- origem porque o banco nao compara linhas entre si num CHECK; a regra fica em
-- Titulo.substituindo(), que e o unico lugar que cria versao > 1.
ALTER TABLE titulos ADD CONSTRAINT chk_titulos_versao CHECK (versao >= 1);

-- titulos.versao: Qual tentativa desta parcela esta linha e. 1 na emissao do
--   carne; 2 quando a parcela foi estornada ou renegociada e reemitida, e assim
--   por diante. Junto com titulo_origem_id, e o que faz o historico financeiro
--   continuar inteiro depois de uma correcao.
