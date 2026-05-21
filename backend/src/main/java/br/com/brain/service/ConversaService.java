package br.com.brain.service;

import br.com.brain.domain.conversa.Conversa;
import br.com.brain.domain.conversa.ConversaRepository;
import br.com.brain.domain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.domain.mensagem.Mensagem;
import br.com.brain.domain.mensagem.MensagemRepository;
import br.com.brain.domain.perfil.PerfilRepository;
import br.com.brain.dto.conversa.CadastroConversaDto;
import br.com.brain.dto.conversa.ConversaNaoLidaContagem;
import br.com.brain.dto.conversa.ListagemConversaDto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.enums.StatusConversa;
import br.com.brain.exception.ErrosSistema;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversaService {

    private final ConversaRepository conversaRepository;
    private final MensagemRepository mensagemRepository;
    private final PerfilRepository perfilRepository;
    private final DadosPessoaisRepository dadosPessoaisRepository;

    @Transactional
    public Conversa abrir(CadastroConversaDto dados, Long remetenteId) {
        var remetente = dadosPessoaisRepository.findById(remetenteId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("DadosPessoais", remetenteId));

        var remetentePerfil = remetente.getPerfis().stream()
                .findFirst()
                .orElseThrow(() -> ErrosSistema.OperacaoInvalidaException.com("Usuário sem perfil definido."));

        var destinatario = perfilRepository.findByNome(dados.destinatarioPerfilNome());
        if (destinatario == null) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Perfil", dados.destinatarioPerfilNome());
        }

        var conversa = new Conversa();
        conversa.setTitulo(dados.titulo());
        conversa.setRemetente(remetente);
        conversa.setRemetentePerfil(remetentePerfil);
        conversa.setDestinatario(destinatario);
        conversaRepository.save(conversa);

        var mensagem = new Mensagem();
        mensagem.setConversa(conversa);
        mensagem.setRemetente(remetente);
        mensagem.setConteudo(dados.primeiraMensagem());
        mensagemRepository.save(mensagem);

        return conversa;
    }

    public Page<ListagemConversaDto> listarPorDestinatario(Long dadosPessoaisId, PerfilNome perfilNome,
            Pageable pageable) {
        var dadosPessoais = dadosPessoaisRepository.findById(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("DadosPessoais", dadosPessoaisId));
        boolean possuiPerfil = dadosPessoais.getPerfis().stream()
                .anyMatch(p -> p.getNome() == perfilNome);
        if (!possuiPerfil) {
            throw ErrosSistema.OperacaoInvalidaException.com("Usuário não possui o perfil " + perfilNome);
        }
        var pagina = conversaRepository.findByDestinatarioNome(perfilNome, pageable);
        var naoLidas = buscarNaoLidasEmLote(pagina.getContent().stream().map(Conversa::getId).toList(), dadosPessoaisId);
        return pagina.map(c -> new ListagemConversaDto(c, naoLidas.getOrDefault(c.getId(), 0L)));
    }

    public Page<ListagemConversaDto> listarPorRemetente(Long dadosPessoaisId, Pageable pageable) {
        var pagina = conversaRepository.findByRemetenteId(dadosPessoaisId, pageable);
        var naoLidas = buscarNaoLidasEmLote(pagina.getContent().stream().map(Conversa::getId).toList(), dadosPessoaisId);
        return pagina.map(c -> new ListagemConversaDto(c, naoLidas.getOrDefault(c.getId(), 0L)));
    }

    private Map<Long, Long> buscarNaoLidasEmLote(List<Long> conversaIds, Long dadosPessoaisId) {
        if (conversaIds.isEmpty()) return Map.of();
        return mensagemRepository.countNaoLidasGroupedByConversaId(conversaIds, dadosPessoaisId)
                .stream()
                .collect(Collectors.toMap(ConversaNaoLidaContagem::conversaId, ConversaNaoLidaContagem::total));
    }

    public long contarNaoLidas(Long dadosPessoaisId) {
        return mensagemRepository.countConversasComRespostaNaoLida(dadosPessoaisId);
    }

    public ListagemConversaDto detalhar(Long id, Long dadosPessoaisId) {
        var conversa = conversaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Conversa", id));
        return new ListagemConversaDto(conversa, mensagemRepository.countNaoLidasByConversaId(id, dadosPessoaisId));
    }

    @Transactional
    public Conversa fechar(Long id) {
        var conversa = conversaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Conversa", id));

        if (conversa.getStatus() == StatusConversa.FECHADA) {
            throw ErrosSistema.OperacaoInvalidaException.com("Conversa já está fechada.");
        }

        conversa.setStatus(StatusConversa.FECHADA);
        conversaRepository.save(conversa);
        return conversa;
    }
}
