# Módulo Professor

Módulo responsável pelo CRUD completo de professores: cadastro, edição e listagem.

---

## Estrutura de Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `page.tsx` | Formulário de cadastro/edição (modo determinado pelo search param `?id=`) |
| `lista/page.tsx` | Listagem com ações de editar e excluir |
| `schema.ts` | Schema Zod + tipos TypeScript + defaultValues do formulário |
| `professorUtils.ts` | Funções puras de mapeamento Form ↔ API |
| `useProfessorMutations.tsx` | Hook com mutations React Query (create, update, delete) |
| `styles.ts` | Styled-components isolados do módulo |

---

## Padrões de Código

### Stack
- **React Hook Form** + **Zod** via `useBrainForm` para forms
- **React Query** (TanStack Query v5) para mutations e cache
- **Styled Components** para estilos isolados por módulo
- **MUI** para componentes base (Container, Box, IconButton, Checkbox, etc.)
- **BrainForms** para todos os campos de formulário (ver seção abaixo)

### Convenções de nomenclatura
- Componentes: `PascalCase` — ex: `DependenteRow`, `ExameUpload`
- Hooks: `camelCase` com prefixo `use` — ex: `useProfessorMutations`
- Funções de mapeamento: `mapFormDataTo<Destino>` / `map<Origem>ToFormData`
- Constantes de opções: `OPTIONS_<NOME>` em `SCREAMING_SNAKE_CASE`
- Tipos Zod: `z.infer<typeof schema>` exportado junto ao schema

### Componentização
- **Componentes internos simples** (ex: `DependenteRow`, `ExameUpload`) ficam no próprio `page.tsx` quando são usados apenas ali
- **Mova para arquivo próprio** apenas se o componente for reutilizado em ≥2 lugares
- **Não** criar HOCs, wrappers ou providers desnecessários

---

## BrainForms — Componentes de Formulário

Todos os campos de formulário devem usar os componentes BrainForms em vez de campos MUI puros:

| Componente | Caso de uso |
|---|---|
| `BrainTextFieldControlled` | Input de texto genérico (suporta `multiline`, `rows`, `type`) |
| `BrainDropdownControlled` | Select simples |
| `BrainMultiSelectControlled` | Multi-select com autocomplete e checkboxes |
| `BrainDateTextControlled` | Data no formato `dd/mm/aaaa` com máscara |
| `BrainTextCPFControlled` | CPF com máscara `000.000.000-00` |
| `BrainTextRGControlled` | RG com máscara |
| `BrainTextCEPControlled` | CEP com máscara `00000-000` |
| `BrainTextPhoneControlled` | Telefone com máscara `(00) 00000-0000` |
| `BrainTextHorarioControlled` | Horário `HH:MM` |
| `BrainFormProvider` | Wrapper obrigatório do form (conecta React Hook Form ao `<form>`) |

> **Nota:** Campos com máscaras ainda não existentes (Título de Eleitor, PIS/PASEP, CTPS) usam `BrainTextFieldControlled` com placeholder indicando o formato esperado. Criar componentes mascarados específicos quando necessário.

---

## Seções do Formulário

### 1. Dados Pessoais (`numberOfCollumns={2}`)
- Nome Completo*, Nome Social — **largura total** (`gridColumn: "1 / -1"`)
- E-mail* | Data de Nascimento*
- Gênero* | Cor/Raça*
- Cidade de Naturalidade* | CPF*
- RG* | Carteira de Trabalho*
- Título de Eleitor* | PIS/PASEP*

### 2. Endereço (`numberOfCollumns={3}`)
- CEP* (com spinner de busca automática) | Logradouro* | Número*
- Complemento | Bairro* | Cidade*
- UF*

### 3. Contato (`numberOfCollumns={2}`)
- Telefone* (ocupa 1 coluna)

### 4. Disciplinas (`numberOfCollumns={1}`)
- Disciplinas* (multi-select com fallback mock)

### 5. Dados Bancários Opcional (`numberOfCollumns={3}`)
- Nome do Banco | Tipo de Conta | Agência
- Conta | Chave PIX

### 6. Dependentes (`numberOfCollumns={1}`)
- Estado vazio com ícone e mensagem "Nenhum dependente adicionado"
- Lista dinâmica via `useFieldArray`
- Botão "Adicionar Dependente"

### 7. Informações Profissionais (`numberOfCollumns={2}`)
- Escolaridade* | Enquadramento de Hora Aula*
- Checkbox: Exame admissional realizado — **largura total**
- Upload de arquivo (condicional, só aparece se checkbox marcado) — **largura total**
- Data de Início das Férias | Data de Fim das Férias
- Observações sobre Férias (textarea) — **largura total**

### 8. Footer
- Checkbox LGPD* com validação (`aceitoLgpd: true` é obrigatório)
- Botões: Cancelar | Salvar Professor

---

## Considerações Importantes

### Modo edição vs criação
- Determinado por `useBrainSearchParams("id")`
- `isEditMode = !!professorId`
- Requer `<Suspense>` no componente exportado por usar `useSearchParams`

### Mapeamento de dados (`professorUtils.ts`)
| Direção | Função |
|---|---|
| Form → POST | `mapFormDataToProfessorPostRequest` |
| Form → PUT | `mapFormDataToProfessorPutRequest` |
| API → Form | `mapProfessorResponseToFormData` |

- **Campos mascarados devem ser desmascados antes do envio:** `unmaskCPF`, `unmaskRG`, `unmaskCEP`, `unmaskPhone`
- **Datas:** formulário usa `dd/mm/aaaa`, API usa ISO 8601 — converter com `convertDateStringToISO` (envio) e `convertISOToDateString` (recebimento)
- **aceitoLgpd** não é enviado à API — é apenas validação de consentimento local

### Telefone
- Formulário: campo único
- API recebe/retorna array `telefones: string[]`
- Envio: `telefones: [unmaskPhone(formData.telefone)]`
- Recebimento: `telefones[0]`

### Dados Bancários
- Todos opcionais — `buildDadosBancarios()` retorna `undefined` se todos vazios

### Dependentes
- `useFieldArray` com `name: "dependentes"`
- Sempre usar `dependenteDefaultValues` no `appendDependente()`
- Estado vazio renderiza `EmptyDependentesContainer`

### Busca automática de CEP
- Disparada por `useEffect` no `watch("cep")`
- Executa apenas quando `cep.length === 9`
- Preenche: `logradouro`, `bairro`, `cidade`, `uf`, `complemento`
- Exibe `CircularProgress` durante a busca

### Upload de Exame Admissional
- Controlado por estado local (`exameFileName`) — **não** integrado ao React Hook Form
- Só aparece quando `exameAdmissionalRealizado === true`
- Aceita: PDF, JPG, PNG — máximo 5MB
- Validação de tamanho no `onChange` antes de aceitar o arquivo
- **TODO:** implementar upload real para S3/servidor quando backend disponível

### Disciplinas — fallback mock
- Se a API de disciplinas retornar vazio, usa `MOCK_DISCIPLINAS` (constante no `page.tsx`)
- Remover mock após integração real estar estável

### React Query / Cache
- Após create, update, delete: invalida `QUERY_KEYS.professores.all`
- Mutations centralizadas em `useProfessorMutations`
- Verificar `isPending` para estado de loading no botão de submit

### Validação (schema Zod)
- `mode: "all"` — valida em blur e onChange
- CPF: `/^\d{3}\.\d{3}\.\d{3}-\d{2}$/`
- CEP: `/^\d{5}-\d{3}$/`
- Telefone: `/^\(\d{2}\) \d{4,5}-\d{4}$/`
- Data: `/^\d{2}\/\d{2}\/\d{4}$/`
- LGPD: `.refine(val => val === true)`

### Proteção de rota
- Centralizada no middleware (`src/middleware.ts`) e no `routesConfig.tsx`. As páginas não precisam envolver nada — quem chega na rota já passou pela validação de role.

---

## APIs Necessárias

### 1. Criar Professor
**POST** `/api/professores`

**Request:**
```json
{
  "nome": "string",
  "nomeSocial": "string",
  "email": "string",
  "dataDeNascimento": "2000-01-15T00:00:00Z",
  "genero": "masculino | feminino | nao_binario | outro | prefiro_nao_informar",
  "corRaca": "branca | preta | parda | amarela | indigena | nao_declarado",
  "cidadeNaturalidade": "string",
  "cpf": "00000000000",
  "rg": "000000000",
  "carteiraDeTrabalho": "string",
  "tituloEleitor": "string",
  "pisPasep": "string",
  "telefones": ["11999999999"],
  "endereco": {
    "cep": "01310100",
    "logradouro": "string",
    "numero": "string",
    "complemento": "string",
    "bairro": "string",
    "cidade": "string",
    "uf": "SP"
  },
  "disciplinaIds": [1, 2, 3],
  "dadosBancarios": {
    "nomeBanco": "string",
    "tipoConta": "conta_corrente | conta_poupanca | conta_salario",
    "agencia": "string",
    "conta": "string",
    "chavePix": "string"
  },
  "dependentes": [
    {
      "nomeCompleto": "string",
      "cpf": "00000000000",
      "dataDeNascimento": "2010-05-20T00:00:00Z",
      "parentesco": "filho | conjugue | pai | mae | outro"
    }
  ],
  "escolaridade": "string",
  "enquadramentoHoraAula": "nivel_i | nivel_ii | nivel_iii | nivel_iv",
  "exameAdmissionalRealizado": true,
  "dataInicioFerias": "2025-01-01T00:00:00Z",
  "dataFimFerias": "2025-01-31T00:00:00Z",
  "observacoesFerias": "string"
}
```

**Response 201:**
```json
{
  "id": 1,
  "matricula": "PROF-2025-001",
  "nome": "string",
  "email": "string"
}
```

---

### 2. Editar Professor
**PUT** `/api/professores/{id}`

**Request:** Mesmo body do POST acrescido de `id`.

**Response 200:**
```json
{ "id": 1, "matricula": "PROF-2025-001" }
```

---

### 3. Buscar Professor por ID
**GET** `/api/professores/{id}`

**Response 200:** `ProfessorDetalheResponse` (ver `response.ts`)

---

### 4. Listar Professores
**GET** `/api/professores?page=0&size=20&search=João`

**Response 200:**
```json
{
  "content": [ /* ProfessorListaResponse[] */ ],
  "totalElements": 100,
  "totalPages": 5,
  "page": 0
}
```

---

### 5. Excluir Professor
**DELETE** `/api/professores/{id}`

**Response 204:** No content.

---

### 6. Listar Disciplinas
**GET** `/api/disciplinas`

**Response 200:**
```json
[
  { "id": 1, "nome": "Matemática" },
  { "id": 2, "nome": "Língua Portuguesa" }
]
```

---

### 7. Upload de Exame Admissional
**POST** `/api/professores/{id}/exame-admissional`

**Request:** `multipart/form-data` com campo `file`.

**Response 200:**
```json
{ "url": "https://storage.exemplo.com/exames/arquivo.pdf" }
```

---

### 8. Busca de CEP (ViaCEP — externa)
**GET** `https://viacep.com.br/ws/{cep}/json/`

**Response 200:**
```json
{
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "bairro": "Bela Vista",
  "localidade": "São Paulo",
  "uf": "SP",
  "erro": false
}
```

---

## Como Integrar com APIs

1. Adicionar o endpoint em `src/services/domains/professor/client.ts`
2. Atualizar os tipos em `request.ts` / `response.ts` se necessário
3. Criar/atualizar o hook React Query correspondente
4. Atualizar `professorUtils.ts` se o mapeamento precisar mudar
5. **Nunca** fazer chamadas de API diretamente na `page.tsx`

### Exemplo de integração de upload:
```typescript
// Em useProfessorMutations.tsx
const uploadExame = useMutation({
  mutationFn: ({ id, file }: { id: string; file: File }) => {
    const form = new FormData();
    form.append("file", file);
    return professorApi.uploadExameAdmissional(id, form);
  },
  onSuccess: () => toast.success("Exame enviado com sucesso!"),
  onError: () => toast.error("Erro ao enviar exame."),
});
```

---

## Boas Práticas para Futuras Implementações

- **Novos campos no formulário** → atualizar `schema.ts`, `professorUtils.ts`, `request.ts`, `response.ts`
- **Novos componentes de máscara** → criar em `src/components/brainForms/brain<Nome>Controlled/`
- **Não duplicar lógica de invalidação** — mutations centralizam isso
- **Não commitar `MOCK_DISCIPLINAS`** em produção — remover após integração real
- **Testar modo criação e edição** antes de qualquer PR
- **Campos de arquivo** são estado local (`useState`) — não integrar ao React Hook Form diretamente
