package br.com.brain.permissao;

import br.com.brain.perfil.Perfil;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Página navegável do frontend, no catálogo de permissões.
 *
 * O catálogo pertence ao código: só muda por migration, por isso não há
 * setters nem auditoria. O codigo é a chave do RoutesEnum no frontend e é por
 * ele que front, back e seed se referem à tela — nunca pelo id nem pela rota.
 */
@Entity
@Table(name = "telas")
@Getter
@NoArgsConstructor
public class Tela extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    private String nome;
    private String rota;

    @Column(name = "exibir_menu")
    private Boolean exibirMenu;

    private Boolean ativo;

    /**
     * Teto: perfis que podem receber a tela. List, e não Set, porque o
     * hashCode do Perfil (@Data) percorre as coleções dele.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "telas_perfis",
            joinColumns = @JoinColumn(name = "tela_id"),
            inverseJoinColumns = @JoinColumn(name = "perfil_id"))
    private List<Perfil> perfisPermitidos = new ArrayList<>();
}
