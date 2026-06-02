-- conteudos: id BIGSERIAL NOT NULL sem PRIMARY KEY
ALTER TABLE conteudos ADD CONSTRAINT conteudos_pkey PRIMARY KEY (id);

-- disciplinas_grades: tabela de juncao sem id proprio, PK composta pelas FK
ALTER TABLE disciplinas_grades ADD CONSTRAINT disciplinas_grades_pkey PRIMARY KEY (disciplina_id, grade_curricular_id);
