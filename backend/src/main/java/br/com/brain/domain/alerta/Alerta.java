package br.com.brain.domain.alerta;

import java.time.LocalDate;
import java.util.List;

import br.com.brain.domain.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "alertas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Alerta extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    private String conteudo;

    @Column(name = "data_publicacao")
    private LocalDate data;

    @NotAudited
    @OneToMany(mappedBy = "alerta", fetch = FetchType.LAZY)
    private List<AlertaUsuario> usuarios;
}
