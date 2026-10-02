package br.com.brain.comunicado;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.comunicado.dto.DestinatarioComunicadoDto;
import br.com.brain.enums.ComunicadoAbrangenciaEnum;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.serie.Serie;
import br.com.brain.serie.SerieRepository;
import br.com.brain.turma.Turma;
import br.com.brain.turma.TurmaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Define o público-alvo de um comunicado: guarda as regras escolhidas pelo autor e materializa,
 * no momento da publicação, a lista de usuários que passam a enxergá-lo no mural.
 *
 * A materialização é intencional: quem estava na turma quando o comunicado saiu continua recebendo,
 * e quem entrou depois não recebe retroativamente.
 */
@Service
@RequiredArgsConstructor
public class ComunicadoDestinatarioService {

    private final ComunicadoDestinatarioRepository destinatarioRepository;
    private final ComunicadoUsuarioRepository comunicadoUsuarioRepository;
    private final ComunicadoPublicoRepository publicoRepository;
    private final TurmaRepository turmaRepository;
    private final SerieRepository serieRepository;

    @PersistenceContext
    private EntityManager em;

    /**
     * Substitui o público-alvo do comunicado pelas regras informadas e reentrega para o novo público.
     * Lista vazia ou nula deixa o comunicado sem restrição, visível para todos.
     */
    @Transactional
    public List<ComunicadoDestinatario> definirDestinatarios(Comunicado comunicado,
            List<DestinatarioComunicadoDto> dados) {

        limpar(comunicado.getId());

        if (dados == null || dados.isEmpty()) {
            return List.of();
        }

        var destinatarios = new ArrayList<ComunicadoDestinatario>();
        for (var dado : dados) {
            destinatarios.add(montar(comunicado, dado));
        }
        destinatarioRepository.saveAll(destinatarios);

        entregar(comunicado, resolverUsuarios(destinatarios));

        return destinatarios;
    }

    /** Remove as regras de público e as entregas já feitas — usado na exclusão e antes de redefinir. */
    @Transactional
    public void limpar(Long comunicadoId) {
        comunicadoUsuarioRepository.deleteByComunicadoId(comunicadoId);
        destinatarioRepository.deleteByComunicadoId(comunicadoId);
    }

    private ComunicadoDestinatario montar(Comunicado comunicado, DestinatarioComunicadoDto dado) {
        var destinatario = new ComunicadoDestinatario();
        destinatario.setComunicado(comunicado);
        destinatario.setPublico(dado.publico());
        destinatario.setAbrangencia(dado.abrangencia());

        if (dado.abrangencia() == ComunicadoAbrangenciaEnum.TURMA) {
            if (dado.turmaId() == null) {
                throw new ErrosSistema.OperacaoInvalidaException(
                        "Informe a turma ao direcionar o comunicado para uma turma.");
            }
            destinatario.setTurma(buscarTurma(dado.turmaId()));
        } else if (dado.abrangencia() == ComunicadoAbrangenciaEnum.SEGMENTO) {
            if (dado.serieId() == null) {
                throw new ErrosSistema.OperacaoInvalidaException(
                        "Informe o segmento ao direcionar o comunicado para um segmento.");
            }
            destinatario.setSerie(buscarSerie(dado.serieId()));
        }

        return destinatario;
    }

    private Turma buscarTurma(Long id) {
        return turmaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));
    }

    private Serie buscarSerie(Long id) {
        return serieRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Serie", id));
    }

    private Set<Long> resolverUsuarios(List<ComunicadoDestinatario> destinatarios) {
        var usuarios = new LinkedHashSet<Long>();

        for (var destinatario : destinatarios) {
            Long turmaId = destinatario.getTurma() != null ? destinatario.getTurma().getId() : null;
            Long serieId = destinatario.getSerie() != null ? destinatario.getSerie().getId() : null;

            switch (destinatario.getPublico()) {
                case ALUNOS -> usuarios.addAll(publicoRepository.buscarUsuariosAlunos(turmaId, serieId));
                case RESPONSAVEIS -> usuarios.addAll(publicoRepository.buscarUsuariosResponsaveis(turmaId, serieId));
                case PROFESSORES -> usuarios.addAll(publicoRepository.buscarUsuariosProfessores(turmaId, serieId));
                case TODOS -> {
                    usuarios.addAll(publicoRepository.buscarUsuariosAlunos(turmaId, serieId));
                    usuarios.addAll(publicoRepository.buscarUsuariosResponsaveis(turmaId, serieId));
                    usuarios.addAll(publicoRepository.buscarUsuariosProfessores(turmaId, serieId));
                }
            }
        }

        return usuarios;
    }

    private void entregar(Comunicado comunicado, Set<Long> usuarioIds) {
        for (Long usuarioId : usuarioIds) {
            var entrega = new ComunicadoUsuario();
            entrega.setComunicadoId(comunicado);
            entrega.setUsuarioId(em.getReference(DadosAutenticacao.class, usuarioId));
            em.persist(entrega);
        }
        em.flush();
    }
}
