-- Acessos individuais (docs/permissoes.md, D18–D21).
--
-- Um grupo com dados_pessoais_id preenchido é o grupo individual daquela pessoa
-- no perfil: os acessos dele somam aos dos grupos normais pela mesma regra
-- (RP1), porque a pessoa também entra como membro. Coluna vazia = grupo normal.
--
-- Sem ON DELETE CASCADE, como os vínculos da V111: telas e controles do grupo
-- saem pelo JPA, para o Envers registrar. O sistema não apaga pessoas.

ALTER TABLE grupos_usuarios ADD COLUMN dados_pessoais_id BIGINT;

ALTER TABLE grupos_usuarios ADD CONSTRAINT fk_grupos_usuarios_individual
    FOREIGN KEY (dados_pessoais_id) REFERENCES dados_pessoais(id);

-- Um grupo individual por pessoa em cada perfil. Nos grupos normais a coluna é
-- nula, e nulos não se repetem para um UNIQUE (PostgreSQL e H2).
ALTER TABLE grupos_usuarios ADD CONSTRAINT uk_grupos_usuarios_individual
    UNIQUE (perfil_id, dados_pessoais_id);

ALTER TABLE grupos_usuarios_AUD ADD COLUMN dados_pessoais_id BIGINT;
