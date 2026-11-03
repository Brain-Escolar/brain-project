package br.com.brain.dadosPessoais;

import java.text.Normalizer;
import java.util.Optional;

import org.springframework.stereotype.Service;

import br.com.brain.dadosPessoais.dto.PessoaExistenteDto;
import br.com.brain.exception.ErrosSistema;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DadosPessoaisService {

    private final DadosPessoaisRepository dadosPessoaisRepository;

    public Optional<DadosPessoais> buscarDadosPessoaisPorCpf(String cpf) {
        return dadosPessoaisRepository.findByCpf(cpf);
    }

    public DadosPessoais salvar(DadosPessoais dadosPessoais) {
        return dadosPessoaisRepository.save(dadosPessoais);
    }

    /**
     * Pessoa ja cadastrada com este CPF ou e-mail, em qualquer papel.
     * Usado pelos formularios de cadastro antes do envio.
     */
    @Transactional
    public Optional<PessoaExistenteDto> verificarExistente(String cpf, String email) {
        return buscarExistente(cpf, email, null).map(PessoaExistenteDto::new);
    }

    /**
     * Uma pessoa tem um unico dados_pessoais, seja qual for o papel: o
     * professor que tambem e responsavel e a mesma linha nas duas tabelas de
     * ator. Todo cadastro de ator passa por aqui em vez de salvar um
     * DadosPessoais novo.
     *
     * Se a pessoa ja existe (pelo CPF, ou pelo e-mail quando veio sem CPF,
     * como o lead do CRM), devolve o registro existente e so preenche o que
     * estava vazio nele — nunca sobrescreve: o que ja esta la pode ter sido
     * validado pela secretaria em outro papel, e o e-mail e o login.
     * Senao, salva o candidato.
     */
    @Transactional
    public DadosPessoais reaproveitarOuCriar(DadosPessoais candidato) {
        return buscarExistente(candidato.getCpf(), candidato.getEmail(), candidato.getNome())
                .map(existente -> complementar(existente, candidato))
                .orElseGet(() -> dadosPessoaisRepository.save(candidato));
    }

    /**
     * nome == null so na consulta do formulario, que mostra a pessoa achada e
     * deixa quem cadastra decidir.
     */
    private Optional<DadosPessoais> buscarExistente(String cpf, String email, String nome) {
        var porCpf = preenchido(cpf) ? dadosPessoaisRepository.findByCpf(cpf) : Optional.<DadosPessoais>empty();
        var porEmail = preenchido(email) ? dadosPessoaisRepository.findByEmailIgnoreCase(email.trim())
                : Optional.<DadosPessoais>empty();

        if (porCpf.isPresent() && porEmail.isPresent() && !porCpf.get().getId().equals(porEmail.get().getId())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O CPF informado pertence a " + porCpf.get().getNome() + ", mas o e-mail pertence a "
                            + porEmail.get().getNome() + ". Confira os dados.");
        }

        if (porCpf.isPresent()) {
            return porCpf;
        }
        // Achou pelo e-mail uma pessoa com outro CPF: nao e a mesma pessoa.
        if (porEmail.isPresent() && preenchido(cpf) && preenchido(porEmail.get().getCpf())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O e-mail informado já pertence a " + porEmail.get().getNome() + ", com outro CPF.");
        }
        // Sem CPF para confirmar, o e-mail sozinho nao basta: o lead do CRM
        // costuma vir com o e-mail do pai, e reaproveitar faria do pai o aluno.
        if (porEmail.isPresent() && nome != null && !mesmoNome(nome, porEmail.get().getNome())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O e-mail informado já pertence a " + porEmail.get().getNome() + ". Use outro e-mail.");
        }
        return porEmail;
    }

    private static boolean mesmoNome(String a, String b) {
        return normalizar(a).equals(normalizar(b));
    }

    private static String normalizar(String nome) {
        if (nome == null) return "";
        return Normalizer.normalize(nome, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase();
    }

    private DadosPessoais complementar(DadosPessoais existente, DadosPessoais candidato) {
        if (!preenchido(existente.getCpf())) existente.setCpf(candidato.getCpf());
        if (!preenchido(existente.getRg())) existente.setRg(candidato.getRg());
        if (!preenchido(existente.getNomeSocial())) existente.setNomeSocial(candidato.getNomeSocial());
        if (existente.getDataDeNascimento() == null) existente.setDataDeNascimento(candidato.getDataDeNascimento());
        if (existente.getEndereco() == null || !preenchido(existente.getEndereco().getLogradouro())) {
            existente.setEndereco(candidato.getEndereco());
        }
        if (!preenchido(existente.getGenero())) existente.setGenero(candidato.getGenero());
        if (!preenchido(existente.getCorRaca())) existente.setCorRaca(candidato.getCorRaca());
        if (!preenchido(existente.getCidadeNaturalidade())) {
            existente.setCidadeNaturalidade(candidato.getCidadeNaturalidade());
        }
        if (!preenchido(existente.getCarteiraDeTrabalho())) {
            existente.setCarteiraDeTrabalho(candidato.getCarteiraDeTrabalho());
        }
        if (existente.getTelefonesNumeros().isEmpty()) {
            existente.setTelefones(candidato.getTelefonesNumeros());
        }
        return dadosPessoaisRepository.save(existente);
    }

    private static boolean preenchido(String valor) {
        return valor != null && !valor.isBlank();
    }
}
