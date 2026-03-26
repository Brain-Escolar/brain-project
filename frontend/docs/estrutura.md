# 🗂️ Estrutura de Pastas

Este projeto utiliza uma estrutura modular para manter o código organizado, reutilizável e escalável. Abaixo, uma explicação de cada pasta principal:

---

## `/app`

Pasta principal do **App Router** do Next.js 13+ (ou Next.js 15), responsável pelas rotas e páginas da aplicação.

- Cada subpasta representa uma rota (`/app/dashboard`, `/app/login`, etc).
- Suporta **layouts aninhados**, **Server Components**, **loading.tsx**, **error.tsx**, e muito mais.
- Aqui também ficam os arquivos de metadados (`metadata`, `page.tsx`, `layout.tsx`).

---

## `/components`

Contém todos os **componentes reutilizáveis** da interface (UI):

- Botões, inputs, modais, headers, etc.
- Organizados por pastas se necessário (`/components/Button`, `/components/Modal`, ...).
- Preferencialmente escritos como **Client Components** (com `"use client"` no topo) quando houver interação.

---

## `/hooks`

Custom Hooks React que encapsulam lógicas reutilizáveis.

- Exemplo: `useAuth`, `useDebounce`, `useLocalStorage`.
- Evita duplicação de código e facilita testes.

---

## `/lib`

Contém **funções auxiliares (helpers)** e bibliotecas internas do projeto.

- Pode incluir formatações de data, cálculos, validações, etc.
- Exemplo: `formatDate.ts`, `slugify.ts`, `auth.ts`.

> 📌 Pode conter funções que não estão diretamente ligadas à interface ou serviços.

---

## `/services`

Responsável por **integrações externas**, como:

- Requisições HTTP via Axios ou Fetch
- Comunicação com APIs REST ou GraphQL
- Exemplo: `api.ts`, `userApi.ts`, `authApi.ts`

---

## `/styles`

Contém os estilos globais e de tema da aplicação:

- Arquivos `.ts` com `styled-components`, `theme.ts`, `global.ts`.
- Contém o reset de CSS e configurações de responsividade.

---

## `/types`

Armazena **tipagens TypeScript** utilizadas em todo o projeto:

- Interfaces, tipos, enums e constantes
- Exemplo: `user.d.ts`, `api.d.ts`, `auth.ts`
