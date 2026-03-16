ALTER TABLE alunos
ADD FOREIGN KEY (unidade_id) REFERENCES unidades(id);
ALTER TABLE alunos
ADD FOREIGN KEY (serie_id) REFERENCES series(id);
ALTER TABLE alunos
ADD FOREIGN KEY (turma_id) REFERENCES turmas(id);

ALTER TABLE aulas RENAME COLUMN turma TO turma_id;
ALTER TABLE aulas ADD FOREIGN KEY (turma_id) REFERENCES turmas(id);

ALTER TABLE disciplinas
ADD FOREIGN KEY (unidade_id) REFERENCES unidades(id);
ALTER TABLE disciplinas
ADD FOREIGN KEY (serie_id) REFERENCES series(id);
