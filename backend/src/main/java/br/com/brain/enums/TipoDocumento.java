package br.com.brain.enums;

public enum TipoDocumento {
    /** RG, CNH ou RNE - qualquer documento oficial com foto. */
    DOCUMENTO_IDENTIDADE("Documento de identidade (RG/CNH/RNE)"),
    CPF("CPF"),
    CERTIDAO_NASCIMENTO("Certidão de nascimento"),
    CARTEIRA_VACINACAO("Carteira de vacinação"),
    HISTORICO_ESCOLAR("Histórico escolar"),
    DECLARACAO_TRANSFERENCIA("Declaração de transferência"),
    COMPROVANTE_RESIDENCIA("Comprovante de residência");

    private final String descricao;

    TipoDocumento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
