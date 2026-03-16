ALTER TABLE alertas
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE alertas
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE alunos
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE alunos
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE anotacoes
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE anotacoes
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE aulas
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE aulas
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE chamadas
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE chamadas
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE comunicados
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE comunicados
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE conteudos
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE conteudos
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE coordenadores
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE coordenadores
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE dados_pessoais
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE dados_pessoais
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE diretores
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE diretores
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE disciplinas
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE disciplinas
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE fichas_medicas
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE fichas_medicas
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE grupos_disciplinas
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE grupos_disciplinas
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE notas
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE notas
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE orientadores
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE orientadores
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE perfis
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE perfis
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE professores
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE professores
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE responsaveis
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE responsaveis
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE recursos_humanos
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE recursos_humanos
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE secretarios
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE secretarios
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE tarefas
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE tarefas
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

ALTER TABLE usuarios
    ADD COLUMN atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE usuarios
    ADD COLUMN atualizado_por BIGINT REFERENCES dados_pessoais(id);

