-- Permite cadastrar um Aluno-lead com dado mínimo (nome + e-mail) a partir do CRM,
-- completando CPF/data de nascimento/endereço depois em "Editar cadastro". Mantém
-- as colunas (e o UNIQUE de cpf) — só remove a obrigatoriedade em dados_pessoais.
ALTER TABLE dados_pessoais ALTER COLUMN cpf DROP NOT NULL;
ALTER TABLE dados_pessoais ALTER COLUMN data_de_nascimento DROP NOT NULL;
ALTER TABLE dados_pessoais ALTER COLUMN logradouro DROP NOT NULL;
ALTER TABLE dados_pessoais ALTER COLUMN bairro DROP NOT NULL;
ALTER TABLE dados_pessoais ALTER COLUMN cep DROP NOT NULL;
ALTER TABLE dados_pessoais ALTER COLUMN uf DROP NOT NULL;
ALTER TABLE dados_pessoais ALTER COLUMN cidade DROP NOT NULL;
