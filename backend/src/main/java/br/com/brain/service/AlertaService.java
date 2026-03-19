package br.com.brain.service;

import br.com.brain.domain.alerta.Alerta;
import br.com.brain.domain.alerta.AlertaRepository;
import br.com.brain.domain.alerta.AlertaUsuarioRepository;
import br.com.brain.dto.alerta.AtualizacaoAlertaDto;
import br.com.brain.dto.alerta.CadastroAlertaDto;
import br.com.brain.dto.alerta.ListagemAlertaDto;
import br.com.brain.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlertaService {

    private final AlertaRepository alertaRepository;
    private final AlertaUsuarioRepository alertaUsuarioRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Alerta cadastrarAlerta(CadastroAlertaDto dados) {

        var alerta = new Alerta();
        alerta.setTitulo(dados.titulo());
        alerta.setConteudo(dados.conteudo());
        alerta.setData(dados.data());

        alertaRepository.save(alerta);

        return alerta;
    }

    public Page<ListagemAlertaDto> listar(Pageable paginacao) {
        return alertaRepository.findAll(paginacao).map(ListagemAlertaDto::new);
    }

    @Transactional
    public Alerta atualizar(AtualizacaoAlertaDto dados, Long id) {
        var alerta = alertaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Alerta", id));

        if (dados.titulo() != null) {
            alerta.setTitulo(dados.titulo());
        }
        if (dados.conteudo() != null) {
            alerta.setConteudo(dados.conteudo());
        }
        if (dados.data() != null) {
            alerta.setData(dados.data());
        }

        alertaRepository.save(alerta);

        return alerta;
    }

    @Transactional
    public void excluir(Long id) {
        var alerta = alertaRepository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Alerta", id));
        alertaRepository.delete(alerta);
    }

    public Alerta detalhar(Long id) {
        return alertaRepository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Alerta", id));
    }

    public void marcarComoLido(Long alertaId, Long usuarioId) {
        var alertaUsuario = alertaUsuarioRepository.findByAlertaIdAndUsuarioId(alertaId, usuarioId).orElseThrow(
                () -> ErrosSistema.RecursoNaoEncontradoException.para("AlertaUsuario", alertaId + " e " + usuarioId));

        alertaUsuario.setLido(true);
        em.merge(alertaUsuario);
    }
}
