package br.com.brain.domain.laudoMedico;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.arquivo.Arquivo;
import br.com.brain.domain.fichamedica.FichaMedica;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "laudos_medicos")
@Data
@EqualsAndHashCode(callSuper = false)
public class LaudoMedico extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "arquivo_id")
    private Arquivo arquivo;

    @ManyToOne
    @JoinColumn(name = "ficha_medica_id")
    private FichaMedica fichaMedica;
}
