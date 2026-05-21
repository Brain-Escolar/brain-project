package br.com.brain.enums;

public enum CursoPretendido {
    ADMINISTRACAO("Administração"),
    AGRONOMIA("Agronomia"),
    ARQUITETURA_E_URBANISMO("Arquitetura e Urbanismo"),
    ARTES_VISUAIS("Artes Visuais"),
    BIOMEDICINA("Biomedicina"),
    CIENCIA_DA_COMPUTACAO("Ciência da Computação"),
    CIENCIAS_BIOLOGICAS("Ciências Biológicas"),
    DIREITO("Direito"),
    ENFERMAGEM("Enfermagem"),
    ENGENHARIA_CIVIL("Engenharia Civil"),
    ENGENHARIA_ELETRICA("Engenharia Elétrica"),
    ENGENHARIA_MECATRONICA("Engenharia Mecatrônica"),
    MEDICINA("Medicina"),
    PEDAGOGIA("Pedagogia"),
    PSICOLOGIA("Psicologia"),
    VETERINARIA("Veterinária");

    private final String descricao;

    CursoPretendido(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
