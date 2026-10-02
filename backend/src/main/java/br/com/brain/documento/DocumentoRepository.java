package br.com.brain.documento;

import br.com.brain.enums.StatusDocumento;
import br.com.brain.enums.TipoDocumento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    Optional<Documento> findByDadosPessoaisIdAndTipo(Long dadosPessoaisId, TipoDocumento tipo);

    @EntityGraph(attributePaths = { "arquivos", "validadoPor" })
    List<Documento> findByDadosPessoaisIdIn(Collection<Long> dadosPessoaisIds);

    @EntityGraph(attributePaths = { "dadosPessoais" })
    Page<Documento> findByStatus(StatusDocumento status, Pageable paginacao);
}
