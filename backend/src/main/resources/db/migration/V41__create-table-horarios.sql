CREATE TABLE horarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id)
);
