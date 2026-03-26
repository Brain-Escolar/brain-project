# Brain Project

Monorepo do projeto Brain escolar - Sistema de gerenciamento de escolas.

## Estrutura

```
brain-project/
├── backend/     # Spring Boot API (Java 23)
└── frontend/    # Next.js Admin Dashboard (React 19)
```

## Desenvolvimento

### Backend
```bash
cd backend
mvn spring-boot:run
```
Rodará em http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Rodará em http://localhost:3000

## Configuração

### Backend
Configure as variáveis de ambiente no arquivo `.env` ou via sistema operacional.

### Frontend
Configure `NEXT_PUBLIC_API_BASE_URL` no arquivo `frontend/.env`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/
```

## Build

```bash
# Backend
cd backend && mvn clean package

# Frontend
cd frontend && npm run build
```

