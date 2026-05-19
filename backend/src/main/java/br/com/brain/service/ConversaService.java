package br.com.brain.service;

import br.com.brain.domain.conversa.Conversa;
import br.com.brain.domain.conversa.ConversaRepository;
import br.com.brain.domain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.domain.mensagem.Mensagem;
import br.com.brain.domain.mensagem.MensagemRepository;
import br.com.brain.domain.perfil.PerfilRepository;
import br.com.brain.dto.conversa.CadastroConversaDto;
import br.com.brain.dto.conversa.ListagemConversaDto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.enums.StatusConversa;
import br.com.brain.exception.ErrosSistema;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
        return conversaRepository.findByDestinatarioNome(perfilNome, pageable)
                .map(ListagemConversaDto::new);
    }

    public Page<ListagemConversaDto> listarPorRemetente(Long dadosPessoaisId, Pageable pageable) {
        return conversaRepository.findByRemetenteId(dadosPessoaisId, pageable)
                .map(ListagemConversaDto::new);
    }

    public ListagemConversaDto detalhar(Long id) {
        var conversa = conversaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Conversa", id));
        return new ListagemConversaDto(conversa);
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
