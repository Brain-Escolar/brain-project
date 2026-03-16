CREATE TABLE escolaridades (
    id BIGSERIAL PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL,
    criado_em TIMESTAMPTZ,
    criado_por BIGINT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_por BIGINT,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id),
    FOREIGN KEY (criado_por) REFERENCES dados_pessoais(id)
);

INSERT INTO escolaridades (descricao) VALUES
('Ensino Fundamental Incompleto'),
('Ensino Fundamental Completo'),
('Ensino Médio Incompleto'),
('Ensino Médio Completo'),
('Ensino Superior Incompleto'),
('Ensino Superior Completo'),
('Pós-Graduação'),
('Mestrado'),
('Doutorado'),
('Pós-Doutorado');
