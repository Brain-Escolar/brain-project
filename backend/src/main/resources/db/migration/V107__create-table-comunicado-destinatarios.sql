-- Público destinatário do comunicado: dois eixos combinados.
--   publico     = quem recebe  (ALUNOS, RESPONSAVEIS, PROFESSORES, TODOS)
--   abrangencia = qual recorte (GERAL, TURMA, SEGMENTO)
-- Um comunicado pode ter várias linhas, ex.: "responsáveis da turma 3A" + "alunos do 9º ano".
-- Comunicado sem nenhuma linha aqui é legado e continua visível para todos.

CREATE TABLE comunicado_destinatarios (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    comunicado_id BIGINT NOT NULL,
    publico VARCHAR(20) NOT NULL,
    abrangencia VARCHAR(20) NOT NULL,
    turma_id BIGINT,
    serie_id BIGINT,
    CONSTRAINT fk_comunicado_destinatarios_comunicado FOREIGN KEY (comunicado_id) REFERENCES comunicados(id) ON DELETE CASCADE,
    CONSTRAINT fk_comunicado_destinatarios_turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
    CONSTRAINT fk_comunicado_destinatarios_serie FOREIGN KEY (serie_id) REFERENCES series(id),
    CONSTRAINT ck_comunicado_destinatarios_alvo CHECK (
        (abrangencia = 'GERAL'    AND turma_id IS NULL     AND serie_id IS NULL) OR
        (abrangencia = 'TURMA'    AND turma_id IS NOT NULL AND serie_id IS NULL) OR
        (abrangencia = 'SEGMENTO' AND turma_id IS NULL     AND serie_id IS NOT NULL)
    )
);

CREATE INDEX idx_comunicado_destinatarios_comunicado ON comunicado_destinatarios(comunicado_id);

-- A PK de comunicados_usuario é (comunicado_id, usuario_id); a listagem do mural filtra por usuário.
CREATE INDEX idx_comunicados_usuario_usuario ON comunicados_usuario(usuario_id);
