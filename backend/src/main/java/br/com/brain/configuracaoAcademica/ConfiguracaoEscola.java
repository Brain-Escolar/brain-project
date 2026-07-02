package br.com.brain.configuracaoAcademica;

import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Configuração da escola (tenant): a escala de avaliação, constante da escola.
 * Linha única por schema — o id é fixo em 1 (CHECK no banco). Os períodos
 * letivos variam por ano e ficam em {@link PeriodoLetivo}.
 */
@Entity
@Table(name = "configuracoes_escola")
@Data
@EqualsAndHashCode(callSuper = false, of = "id")
public class ConfiguracaoEscola extends EntidadeBase {

    public static final long ID_UNICO = 1L;

    @Id
    private Long id = ID_UNICO;

    @Embedded
    private EscalaAvaliacao escala;
}
