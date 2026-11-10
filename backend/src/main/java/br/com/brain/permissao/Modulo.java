package br.com.brain.permissao;

import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Módulo do menu, no catálogo de permissões. Com pai, é um submódulo: hoje, os
 * setores de Cadastros (Pessoas, Estrutura Escolar...).
 *
 * Só organiza a tela de grupos (D34): o menu continua no routesConfig e não há
 * permissão por módulo. O codigo é a chave do RoutesModuleEnum (módulo) ou do
 * RoutesSectionEnum (submódulo) no frontend. Como a Tela, pertence ao código e
 * só muda por migration.
 */
@Entity
@Table(name = "modulos")
@Getter
@NoArgsConstructor
public class Modulo extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_pai_id")
    private Modulo moduloPai;

    /** Posição entre os irmãos. */
    private Integer ordem;

    private Boolean ativo;
}
