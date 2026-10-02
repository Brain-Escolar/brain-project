package br.com.brain.alerta;

import br.com.brain.alerta.dto.AlertaUsuarioListagemDto;
import br.com.brain.alerta.dto.AtualizacaoAlertaDto;
import br.com.brain.alerta.dto.CadastroAlertaDto;
import br.com.brain.alerta.dto.ListagemAlertaDto;
import br.com.brain.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.PerfilRepository;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlertaService {

    private final AlertaRepository alertaRepository;
    private final AlertaUsuarioRepository alertaUsuarioRepository;
    private final DadosPessoaisRepository dadosPessoaisRepository;
    private final PerfilRepository perfilRepository;

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

    /**
     * Cria um alerta e o entrega a todos que tem determinado perfil.
     *
     * A entidade AlertaUsuario existia desde sempre, mas nada no sistema a
     * instanciava: cadastrarAlerta salvava so o Alerta, entao
     * /alerta/meus-alertas voltava vazio para todo mundo. Este metodo e o
     * primeiro a de fato distribuir um alerta.
     *
     * Idempotencia nao e tratada aqui: cada anexo de laudo e um evento novo e
     * merece o seu proprio alerta.
     */
    @Transactional
    public Alerta notificarPerfil(PerfilNome perfilNome, String titulo, String conteudo) {
        var alerta = new Alerta();
        alerta.setTitulo(titulo);
        alerta.setConteudo(conteudo);
        alerta.setData(LocalDate.now());
        alertaRepository.save(alerta);

        var perfil = perfilRepository.findByNome(perfilNome);
        if (perfil == null) {
            return alerta;
        }

        for (var pessoa : dadosPessoaisRepository.findByPerfilNome(perfilNome)) {
            var destinatario = new AlertaUsuario();
            destinatario.setAlerta(alerta);
            destinatario.setUsuario(pessoa);
            destinatario.setPerfil(perfil);
            destinatario.setLido(false);
            alertaUsuarioRepository.save(destinatario);
        }

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

    public Page<AlertaUsuarioListagemDto> listarMeusAlertas(Long usuarioId, Pageable pageable) {
        return alertaUsuarioRepository.findByUsuarioId(usuarioId, pageable)
                .map(AlertaUsuarioListagemDto::new);
    }

    @Transactional
    public void marcarComoLido(Long alertaId, Long usuarioId) {
        var alertaUsuario = alertaUsuarioRepository.findByAlertaIdAndUsuarioId(alertaId, usuarioId).orElseThrow(
                () -> ErrosSistema.RecursoNaoEncontradoException.para("AlertaUsuario", alertaId + " e " + usuarioId));

        alertaUsuario.setLido(true);
        em.merge(alertaUsuario);
    }
}
