-- Migration para a tabela 'planejamentos_anuais' referente à entidade PlanejamentoAnual
CREATE TABLE planejamentos_anuais (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    ano INTEGER,
    arquivo_id BIGINT,
    atualizado_por BIGINT,
    atualizado_em DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (atualizado_por) REFERENCES dados_pessoais(id),
    FOREIGN KEY (arquivo_id) REFERENCES arquivos(id)
);
