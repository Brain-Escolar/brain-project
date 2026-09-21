package br.com.brain.aluno;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * A busca de Matriculas combina matriculado/desmatriculado, nome, serie e
 * unidade como filtros opcionais e combinaveis — o teste garante que cada
 * filtro so entra no predicado final quando informado (senao "leads" vira
 * "todo mundo" ou uma busca vazia derruba resultados validos).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AlunoSpecifications")
class AlunoSpecificationsTest {

    @Mock
    private Root<Aluno> root;
    @Mock
    private CriteriaQuery<?> query;
    @Mock
    private CriteriaBuilder cb;

    @SuppressWarnings("unchecked")
    private Path<Object> path() {
        return mock(Path.class);
    }

    @SuppressWarnings("unchecked")
    private Path<String> stringPath() {
        return mock(Path.class);
    }

    @Test
    @DisplayName("sem nenhum filtro informado, nao adiciona nenhum predicado")
    void semFiltros() {
        var spec = AlunoSpecifications.comFiltros(null, null, null, null, null);

        spec.toPredicate(root, query, cb);

        var captor = ArgumentCaptor.forClass(Predicate[].class);
        verify(cb).and(captor.capture());
        assertThat(captor.getValue()).isEmpty();
    }

    @Test
    @DisplayName("busca em branco nao aplica filtro de nome")
    void buscaEmBranco() {
        var spec = AlunoSpecifications.comFiltros(true, null, "   ", null, null);

        spec.toPredicate(root, query, cb);

        var captor = ArgumentCaptor.forClass(Predicate[].class);
        verify(cb).and(captor.capture());
        assertThat(captor.getValue()).hasSize(1);
    }

    @Test
    @DisplayName("busca por nome aplica like case-insensitive com % nas pontas")
    void buscaPorNome() {
        var dadosPessoais = path();
        Path<String> nome = stringPath();
        when(root.get("dadosPessoais")).thenReturn(dadosPessoais);
        when(dadosPessoais.<String>get("nome")).thenReturn(nome);
        when(cb.lower(nome)).thenReturn(nome);

        var spec = AlunoSpecifications.comFiltros(null, null, "João", null, null);
        spec.toPredicate(root, query, cb);

        verify(cb).like(eq(nome), eq("%joão%"));
    }

    @Test
    @DisplayName("desmatriculado=true filtra dataDesmatricula preenchida; false filtra nula")
    void desmatriculado() {
        var dataDesmatricula = path();
        when(root.get("dataDesmatricula")).thenReturn(dataDesmatricula);

        AlunoSpecifications.comFiltros(null, true, null, null, null).toPredicate(root, query, cb);
        verify(cb).isNotNull(dataDesmatricula);

        AlunoSpecifications.comFiltros(null, false, null, null, null).toPredicate(root, query, cb);
        verify(cb).isNull(dataDesmatricula);
    }

    @Test
    @DisplayName("serieId e unidadeId filtram pelo id da entidade relacionada")
    void serieEUnidade() {
        var serie = path();
        var serieIdPath = path();
        when(root.get("serie")).thenReturn(serie);
        when(serie.get("id")).thenReturn(serieIdPath);

        var unidade = path();
        var unidadeIdPath = path();
        when(root.get("unidade")).thenReturn(unidade);
        when(unidade.get("id")).thenReturn(unidadeIdPath);

        var spec = AlunoSpecifications.comFiltros(null, null, null, 7L, 3L);
        spec.toPredicate(root, query, cb);

        verify(cb).equal(serieIdPath, 7L);
        verify(cb).equal(unidadeIdPath, 3L);
    }

    @Test
    @DisplayName("matriculado true/false filtra pelo proprio campo")
    void matriculado() {
        var matriculadoPath = path();
        when(root.get("matriculado")).thenReturn(matriculadoPath);

        AlunoSpecifications.comFiltros(true, null, null, null, null).toPredicate(root, query, cb);

        verify(cb).equal(matriculadoPath, true);
    }
}
