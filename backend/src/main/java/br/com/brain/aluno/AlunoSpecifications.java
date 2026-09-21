package br.com.brain.aluno;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import org.springframework.data.jpa.domain.Specification;

public class AlunoSpecifications {

    private AlunoSpecifications() {
    }

    public static Specification<Aluno> comFiltros(Boolean matriculado, Boolean desmatriculado,
            String busca, Long serieId, Long unidadeId) {
        return (root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();
            if (matriculado != null) {
                predicates.add(cb.equal(root.get("matriculado"), matriculado));
            }
            if (desmatriculado != null) {
                predicates.add(desmatriculado
                        ? cb.isNotNull(root.get("dataDesmatricula"))
                        : cb.isNull(root.get("dataDesmatricula")));
            }
            if (busca != null && !busca.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("dadosPessoais").get("nome")),
                        "%" + busca.toLowerCase() + "%"));
            }
            if (serieId != null) {
                predicates.add(cb.equal(root.get("serie").get("id"), serieId));
            }
            if (unidadeId != null) {
                predicates.add(cb.equal(root.get("unidade").get("id"), unidadeId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
