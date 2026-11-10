package br.com.brain.permissao;

import br.com.brain.perfil.Perfil;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Capacidade dentro de uma tela (aba, seção, botão, campo), no catálogo.
 *
 * Código no formato DOMINIO.ACAO e sempre positivo. Sem tela, é controle de
 * dado: vale em qualquer tela que mostre o dado, porque o backend não sabe de
 * qual tela veio a requisição.
 */
@Entity
@Table(name = "controles")
@Getter
@NoArgsConstructor
public class Controle extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tela_id")
    private Tela tela;

    private String codigo;
    private String nome;
    private String descricao;
    private Boolean ativo;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "controles_perfis",
            joinColumns = @JoinColumn(name = "controle_id"),
            inverseJoinColumns = @JoinColumn(name = "perfil_id"))
    private List<Perfil> perfisPermitidos = new ArrayList<>();
}
