# Financeiro — V1 enxuta + orçamento de bolsa

Migrations `V100`–`V104`. Sustentam a bolsa na matrícula e a tela de financeiro do
responsável. Boleto, Pix, baixa, régua e NFS-e ficam de fora e entram depois sem
tocar nestas tabelas.

## O que cada migration faz

| Migration | Entrega |
| --- | --- |
| `V100` | classifica `produtos` e cria `produtos_precos` (preço por dimensão e vigência) |
| `V101` | `matriculas`, `contratos_servico`, `contratos_itens`, `titulos` |
| `V102` | `politicas_bolsa`, `tipos_bolsa`, `matrizes_desconto`, `alcadas_desconto`, `envelopes_bolsa`, `concessoes_bolsa`, `movimentos_envelope` |
| `V103` | `simulacoes_financeiras` e `simulacoes_itens` (proposta no CRM + carnê simulado) |
| `V104` | `alunos_responsaveis_financeiros` — quem paga por qual aluno, com rateio e vigência |

São só `CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX`, `INSERT` e tabelas `_AUD`,
no mesmo feitio das `V1`–`V99`. Sem função, sem gatilho, sem view, sem índice
parcial ou sobre expressão — nada que o H2 dos testes não digira.

Convenções seguidas: tabelas no plural, `DECIMAL(10,2)` para dinheiro, colunas de
auditoria `criado_em/criado_por/atualizado_em/atualizado_por`, tabela `_AUD` com FK
para `revinfo`, comentários em `--` (o projeto não usa `COMMENT ON`). Como o
multi-tenancy é schema por escola, não há `mantenedora_id`: a política de bolsa é
única por ano letivo dentro do schema.

**Falta anotar as entidades novas com `@Audited`** para as tabelas `_AUD` serem
preenchidas. As tabelas já existem; só a anotação falta.

## Por que nada de função no banco

Tentei antes colocar o cálculo do teto e a escrita no orçamento como funções
PL/pgSQL, e isso quebrava a suíte: `src/test/resources/application.properties` roda
Flyway com **H2** (`jdbc:h2:mem:testdb;MODE=PostgreSQL`) sobre `classpath:db/migration`,
e o H2 não tem PL/pgSQL, gatilho SQL, índice parcial nem índice sobre expressão.
Todo `@SpringBootTest` quebraria, inclusive os do CRM.

Isolar em `db/migration/postgresql` também não resolve: **o Flyway varre os
locations recursivamente**, então a subpasta é carregada junto.

`00_lint_h2.sh` verifica a regra e serve para CI:

```bash
bash backend/src/test/resources/db/00_lint_h2.sh
```

Falha se alguma construção PostgreSQL-only reaparecer em `db/migration`.

## As regras que ficaram no serviço

O banco garante o que dá para garantir com FK, `CHECK` e `UNIQUE`. O resto é
responsabilidade do serviço — e é o que não pode ser esquecido na implementação.

**1. O teto de concessão de bolsa.** São três limites, e vale o menor:

```
valor_cheio_anual = Σ contratos_itens elegíveis a bolsa, no ano
teto_matriz   = matrizes_desconto[tipo, série, unidade].percentual_max
                (regra mais específica vence: série > unidade > geral,
                 filtrando por vigência na DATA DA PROPOSTA, não "hoje")
teto_alcada   = alcadas_desconto[perfil do usuário].percentual_max

para cada envelope que casa com (unidade, série, tipo_bolsa) e é LIMITE_MAXIMO:
  VALOR_ABSOLUTO         → saldo = valor_limite − (reservado + comprometido)
  PERCENTUAL_RECEITA     → saldo = (base × percentual_limite/100) − (res + comp)
                           base = RECEITA_REALIZADA: Σ valor_bruto dos contratos
                                    vigentes do ano, no escopo
                                  RECEITA_PROJETADA: receita_projetada
  QUANTIDADE_EQUIVALENTE → teto% = (quantidade_limite − equiv consumido) × 100
  SEM_LIMITE             → sem restrição

teto_envelope = min(saldo de cada um) / valor_cheio_anual × 100

pode_conceder = min(teto_matriz, teto_alcada, teto_envelope)
```

A tela mostra o menor em percentual; o cálculo é em reais, porque percentual não
soma entre séries. Estourar a **alçada** bloqueia e escala. Estourar o **envelope**
avisa, exige aval de quem tem `pode_exceder_envelope` e grava
`concessoes_bolsa.excedeu_envelope = true` com `aprovado_por` — sem aprovador
nomeado, não passa.

O teto percentual tem **denominador móvel**: recalcular a cada avaliação, nunca
cachear. E `RECEITA_REALIZADA` vale quase zero no começo da campanha — é por isso
que existe `RECEITA_PROJETADA`.

**2. Escrita no orçamento, sempre em uma transação com lock.** Uma concessão
atinge *todos* os envelopes do escopo (o global, o da série, o do tipo), inclusive
os `META_MINIMA` — estes acumulam mas nunca bloqueiam.

```java
// trave os envelopes em ordem de id (evita deadlock entre duas matrículas)
// @Lock(LockModeType.PESSIMISTIC_WRITE) no repository
// para cada envelope: confira o saldo, insira o movimento, atualize o cache
// tudo dentro do mesmo @Transactional
```

Duas secretarias fechando matrícula ao mesmo tempo enxergam o mesmo saldo — essa é
a corrida que o lock resolve.

| Momento | Movimento |
| --- | --- |
| proposta ao lead | `RESERVA` (+), com `expira_em` |
| lead perdido ou reserva vencida | `LIBERACAO` (−) |
| matrícula efetivada | `LIBERACAO` (−) da reserva + `COMPROMISSO` (+) |
| saída no meio do ano | `ESTORNO` (−) da parte não realizada |

**`movimentos_envelope` é append-only.** Correção é movimento novo de sinal
oposto, nunca `UPDATE` nem `DELETE`. Não há gatilho guardando isso: o repositório
não deve expor `save()` de linha existente nem `delete()` para esta entidade.

**3. Job diário de expiração.** Sem ele, lead morto come o orçamento até dezembro:
liberar toda `RESERVA` com `expira_em < now()` cuja concessão ainda está
`RESERVADA`, e marcar a simulação como `EXPIRADA`.

**4. Job diário de reconciliação.** O cache em `envelopes_bolsa` (`reservado`,
`comprometido`, `reservado_equiv`, `comprometido_equiv`) tem que bater com a soma
de `movimentos_envelope`. Qualquer divergência é bug de transação:

```sql
SELECT e.id, e.reservado, e.comprometido,
       COALESCE(SUM(m.valor) FILTER (WHERE m.tipo IN ('RESERVA','LIBERACAO')), 0)     AS razao_reservado,
       COALESCE(SUM(m.valor) FILTER (WHERE m.tipo IN ('COMPROMISSO','ESTORNO','AJUSTE')), 0) AS razao_comprometido
FROM envelopes_bolsa e
LEFT JOIN movimentos_envelope m ON m.envelope_id = e.id
GROUP BY e.id
HAVING e.reservado <> COALESCE(SUM(m.valor) FILTER (WHERE m.tipo IN ('RESERVA','LIBERACAO')), 0)
    OR e.comprometido <> COALESCE(SUM(m.valor) FILTER (WHERE m.tipo IN ('COMPROMISSO','ESTORNO','AJUSTE')), 0);
```

**5. Unicidades que o `UNIQUE` não expressa**, porque dependem de condição:

- **uma matrícula viva por aluno/ano** — `UNIQUE` simples não serve, porque
  matrícula `CANCELADA` não pode bloquear nova tentativa
- **um pagante principal por aluno** entre os vínculos de vigência aberta
- **um preço por dimensão** em `produtos_precos` — `NULL` significa "vale para
  qualquer" e `NULL` não deduplica em `UNIQUE`

**6. A soma dos títulos tem de bater com o líquido do contrato.** Anuidade com
bolsa raramente divide redonda por 12; a sobra vai na última parcela.

```
parcela = TRUNC(valor_liquido / n, 2)
última  = valor_liquido − parcela × (n − 1)
```

Sem isso o pai soma o carnê e não bate com o contrato — além de confiança, é a
regra de parcelas iguais da Lei 9.870/99.

**7. `contratos_servico.responsavel_id` tem de ser responsável com
`financeiro = TRUE`.** `CHECK` não cruza tabelas.

**8. O rateio vigente de cada aluno tem de somar 100.**

```sql
-- pendências da secretaria: sem pagante, soma ≠ 100, ou sem principal
SELECT a.id, COUNT(arf.id), COALESCE(SUM(arf.percentual_rateio), 0)
FROM alunos a
LEFT JOIN alunos_responsaveis_financeiros arf
       ON arf.aluno_id = a.id AND arf.vigencia_inicio <= CURRENT_DATE
      AND (arf.vigencia_fim IS NULL OR arf.vigencia_fim >= CURRENT_DATE)
GROUP BY a.id
HAVING COUNT(arf.id) = 0
    OR COALESCE(SUM(arf.percentual_rateio), 0) <> 100
    OR COUNT(*) FILTER (WHERE arf.principal) <> 1;
```

**9. Cadastro apto a cobrança.** A V98 tornou CPF e endereço opcionais em
`dados_pessoais` para o lead entrar no CRM com nome e e-mail — e é exatamente o que
o boleto registrado recusa depois. A lista que a secretaria precisa caçar:

```sql
SELECT r.id FROM responsaveis r
JOIN dados_pessoais dp ON dp.id = r.dados_pessoais_id
WHERE r.financeiro = TRUE
  AND (dp.cpf IS NULL OR dp.logradouro IS NULL OR dp.numero IS NULL
       OR dp.bairro IS NULL OR dp.cidade IS NULL OR dp.uf IS NULL OR dp.cep IS NULL);
```

**10. Preço nunca se edita no lugar.** `produtos_precos` é temporal: reajuste é
fechar a vigência da linha atual e inserir outra. Por isso ela não tem tabela
`_AUD` — e não deve ser `@Audited`, porque o `ON DELETE CASCADE` da modalidade
apagaria linhas sem passar pelo Hibernate, deixando buraco na auditoria.

## O que o repositório mudou em relação ao desenho inicial

1. **`responsavel_financeiro` não precisa existir.** `responsaveis` já tem a flag
   `financeiro` (V45) e aponta para `dados_pessoais`, onde moram CPF e endereço.
   A `V104` move o papel para a relação aluno↔responsável, com rateio e vigência;
   `responsaveis.financeiro` fica como legado.
2. **Não existe `segmentos`.** O escopo dos envelopes e da matriz usa `series` e
   `unidades`.
3. **O CRM é `processos_matricula`**, não uma tabela de lead. A simulação aponta
   para o processo, e a matrícula guarda `processo_matricula_id`. O estágio
   "Proposta" do funil é onde a simulação nasce e reserva orçamento.
4. **Dinheiro é `DECIMAL(10,2)`**, a convenção do projeto.

## Sobre `produtos`

`produtos_modalidades.valor` continua funcionando para item de loja. O caminho novo
é `produtos_precos`, que referencia a modalidade e carrega ano letivo, unidade,
série, turno e vigência; a `V100` copia os preços atuais para lá.

Mensalidade entra como produto `RECORRENTE` com uma modalidade (`Padrão`) e uma
linha de preço por série. A **taxa de matrícula** é produto `UNICO`. A **matrícula
em si** não é produto: é `matriculas`, o registro que consome produtos.

`contratos_itens` e `simulacoes_itens` guardam **snapshot** de descrição e valor —
contrato de 2027 continua sabendo o preço de 2027 depois que 2028 entrar.

## Impacto no que já roda

As migrations foram aplicadas sobre as 99 existentes num Postgres limpo, e
`20_regressao.sql` repete por cima as escritas que a aplicação já faz. A primeira
versão quebrava quatro coisas; todas corrigidas:

| Quebra | Correção |
| --- | --- |
| apagar uma **modalidade** passaria a falhar (o backfill cria um preço por modalidade) | `ON DELETE CASCADE` em `produtos_precos` |
| apagar um **produto** passaria a falhar | `ON DELETE CASCADE` em `tipos_bolsa_produtos` |
| apagar um **preço** passaria a falhar | `ON DELETE SET NULL` nos itens — o snapshot fica |
| `ALTER COLUMN TYPE` em `dados_pessoais` passaria a falhar | a view virou query no serviço |

**Mudança de comportamento de propósito:** depois que existirem contratos, apagar
uma modalidade usada em `contratos_itens` vai falhar. Isso está certo — é histórico
financeiro. `produtos_modalidades` já tem `ativo`; a tela deveria desativar.

**O perfil `FINANCEIRO` não é inserido.** `perfis` é espelhada por enums fechados:
`PerfilNome` no Java (`@Enumerated(EnumType.STRING)`, e `Perfil implements
GrantedAuthority`) e `UserRoleEnum`/`PerfilNomeEnum` no frontend. Uma linha que os
enums não conhecem estoura exceção no backend e some no `parseRoles()` do
frontend. Antes de inserir: `PerfilNome.java`, os dois enums do frontend,
`PERFIL_DISPLAY_NAME`, `PRECEDENCIA_PERFIL`, `getDefaultRoute()` e o mapa de rotas.
Até lá, `alcadas_desconto` funciona com `DIRETOR`, `SECRETARIO` e `COORDENADOR`.

**Auditoria e cascade.** Delete em cascata roda no Postgres e não passa pelo
Hibernate, então não gera linha em `_AUD`. Por isso nenhuma tabela auditada nova é
alvo de cascade. O bloco `R10` do teste verifica isso no schema inteiro — e achou
**sete casos pré-existentes**, que apenas avisam:

```
conteudos <- aulas               tarefas <- professores
fichas_medicas <- dados_pessoais   laudos_medicos <- fichas_medicas
medicacoes <- fichas_medicas       mensagens <- conversas
mensagens_lidas <- mensagens
```

Os três de saúde valem uma olhada: apagar uma ficha médica leva laudos e
medicações junto, sem rastro em `_AUD`, e isso é dado sensível.

## Rodar o teste de regressão

```bash
psql -d <banco descartável> -c 'SET search_path=<schema>,public;' \
     -f backend/src/test/resources/db/20_regressao.sql
```

Dez blocos, cada um levanta exceção se quebrar. Insere massa com ids 9xxx.

## Arquivos para apagar

Não consigo apagar arquivos na máquina de vocês, então os que sobraram ficaram
como no-op (`SELECT 1;`) com um marcador `>>> APAGUE ESTE ARQUIVO <<<` no topo.

**A aplicação não sobe enquanto os quatro primeiros existirem**, porque duplicam
as versões 100 e 104 — e o Flyway recusa duas migrations com a mesma versão.

```
backend/src/main/resources/db/migration/
  V100__alter-produtos-add-precos-e-perfil-financeiro.sql   APAGAR
  V104__create-functions-saldo-bolsa.sql                    APAGAR
  V105__create-functions-movimento-bolsa.sql                APAGAR
  V106__create-table-responsaveis-financeiros-por-aluno.sql APAGAR
  postgresql/                                               APAGAR (pasta inteira)

backend/src/test/resources/db/
  10_cenario_bolsa.sql                                      APAGAR
  30_rateio.sql                                             APAGAR
```

**Cuidado com os pares de nome parecido** — o que fica é sempre o de baixo:

| Apagar | Fica |
| --- | --- |
| `V100__alter-produtos-add-precos-e-perfil-financeiro.sql` | `V100__alter-produtos-add-tabela-precos.sql` |
| `V104__create-functions-saldo-bolsa.sql` | `V104__create-table-responsaveis-financeiros-por-aluno.sql` |

O estado final de `db/migration` são cinco arquivos novos, V100 a V104, sem
buraco de numeração.

Se algum banco de desenvolvimento já registrou as versões 105–109 em
`flyway_schema_history`, avise antes de apagar — aí o caminho é `flyway repair`
ou recriar o schema.
