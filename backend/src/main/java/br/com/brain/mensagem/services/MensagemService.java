package br.com.brain.mensagem.services;

import br.com.brain.conversa.repository.ConversaRepository;
import br.com.brain.dadosPessoais.repository.DadosPessoaisRepository;
import br.com.brain.mensagem.models.Mensagem;
import br.com.brain.mensagem.models.MensagemLida;
import br.com.brain.mensagem.repository.MensagemLidaRepository;
import br.com.brain.mensagem.repository.MensagemRepository;
import br.com.brain.mensagem.dto.CadastroMensagemDto;
import br.com.brain.mensagem.dto.ListagemMensagemDto;
import br.com.brain.enums.StatusConversa;
import br.com.brain.exception.ErrosSistema;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MensagemService {

    private final MensagemRepository mensagemRepository;
    private final MensagemLidaRepository mensagemLidaRepository;
    private final ConversaRepository conversaRepository;
    private final DadosPessoaisRepository dadosPessoaisRepository;

    @Transactional
    public Mensagem enviar(Long conversaId, CadastroMensagemDto dados, Long remetenteId) {
        var conversa = conversaRepository.findById(conversaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Conversa", conversaId));

        if (conversa.getStatus() == StatusConversa.FECHADA) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Não é possível enviar mensagens em uma conversa fechada.");
        }

        var remetente = dadosPessoaisRepository.findById(remetenteId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("DadosPessoais", remetenteId));

        var mensagem = new Mensagem();
        mensagem.setConversa(conversa);
        mensagem.setRemetente(remetente);
        mensagem.setConteudo(dados.conteudo());
        mensagemRepository.save(mensagem);

        return mensagem;
    }

    public Page<ListagemMensagemDto> listar(Long conversaId, Pageable pageable) {
        return mensagemRepository.findByConversaId(conversaId, pageable)
                .map(ListagemMensagemDto::new);
    }

    @Transactional
    public void marcarTodasComoLida(Long conversaId, Long dadosPessoaisId) {
        var naoLidas = mensagemRepository.findNaoLidasByConversaId(conversaId, dadosPessoaisId);
        if (naoLidas.isEmpty()) return;

        var dadosPessoais = dadosPessoaisRepository.findById(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("DadosPessoais", dadosPessoaisId));

        var agora = Instant.now();
        for (var mensagem : naoLidas) {
            var lida = new MensagemLida();
            lida.setMensagem(mensagem);
            lida.setDadosPessoais(dadosPessoais);
            lida.setLidaEm(agora);
            mensagemLidaRepository.save(lida);
        }
    }

    @Transactional
    public void marcarComoLida(Long mensagemId, Long dadosPessoaisId) {
        if (mensagemLidaRepository.existsByMensagemIdAndDadosPessoaisId(mensagemId, dadosPessoaisId)) {
            return;
        }

        var mensagem = mensagemRepository.findById(mensagemId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Mensagem", mensagemId));

        var dadosPessoais = dadosPessoaisRepository.findById(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("DadosPessoais", dadosPessoaisId));

        var lida = new MensagemLida();
        lida.setMensagem(mensagem);
        lida.setDadosPessoais(dadosPessoais);
        lida.setLidaEm(Instant.now());
        mensagemLidaRepository.save(lida);
    }
}
