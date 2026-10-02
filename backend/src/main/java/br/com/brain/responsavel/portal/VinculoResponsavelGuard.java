package br.com.brain.responsavel.portal;

import br.com.brain.aluno.Aluno;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.exception.ErrosSistema.AcessoNegadoException;
import br.com.brain.responsavel.Responsavel;
import br.com.brain.responsavel.ResponsavelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ponto unico de autorizacao do Portal do Responsavel.
 *
 * REGRA: toda rota /responsavel/aluno/{alunoId}/** deve comecar por
 * assertPodeVer(usuario, alunoId). Nenhum dado de aluno pode ser devolvido a um
 * responsavel sem passar por aqui - e dado de menor de idade.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VinculoResponsavelGuard {

    private final ResponsavelRepository responsavelRepository;

    /** Resolve o responsavel dono da sessao. Lanca 403 se o usuario nao for um responsavel. */
    @Transactional(readOnly = true)
    public Responsavel resolverResponsavel(DadosAutenticacao usuario) {
        if (usuario == null || usuario.getDadosPessoais() == null) {
            throw new AcessoNegadoException("Sessao sem usuario autenticado.");
        }
        return responsavelRepository
                .findByDadosPessoaisIdComAlunos(usuario.getDadosPessoais().getId())
                .orElseThrow(() -> {
                    log.warn("Usuario dadosPessoaisId={} tentou acessar o portal do responsavel sem cadastro de responsavel.",
                            usuario.getDadosPessoais().getId());
                    return new AcessoNegadoException("Usuario nao possui cadastro de responsavel.");
                });
    }

    /**
     * Devolve o aluno se, e somente se, ele estiver vinculado ao responsavel logado.
     *
     * @throws AcessoNegadoException (403) quando nao ha vinculo.
     */
    @Transactional(readOnly = true)
    public Aluno assertPodeVer(DadosAutenticacao usuario, Long alunoId) {
        var responsavel = resolverResponsavel(usuario);
        return alunoVinculado(responsavel, alunoId);
    }

    /**
     * Idem, mas exige tambem a permissao financeira do responsavel
     * (Responsavel.financeiro). Nem todo responsavel vinculado ve boletos e
     * contratos - so quem a secretaria marcou como responsavel financeiro.
     */
    @Transactional(readOnly = true)
    public Aluno assertPodeVerFinanceiro(DadosAutenticacao usuario, Long alunoId) {
        var responsavel = resolverResponsavel(usuario);
        if (!Boolean.TRUE.equals(responsavel.getFinanceiro())) {
            log.warn("Responsavel id={} sem permissao financeira tentou ver o financeiro do aluno id={}.",
                    responsavel.getId(), alunoId);
            throw new AcessoNegadoException("Responsavel sem permissao para consultar dados financeiros.");
        }
        return alunoVinculado(responsavel, alunoId);
    }

    private Aluno alunoVinculado(Responsavel responsavel, Long alunoId) {
        if (alunoId == null) {
            throw new AcessoNegadoException("Aluno nao informado.");
        }
        var aluno = responsavel.getAlunos().stream()
                .filter(a -> alunoId.equals(a.getId()))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("VINCULO NEGADO: responsavel id={} tentou acessar o aluno id={}.",
                            responsavel.getId(), alunoId);
                    return new AcessoNegadoException("Voce nao tem vinculo com este aluno.");
                });
        log.info("PORTAL RESPONSAVEL: responsavel id={} acessou dados do aluno id={}.",
                responsavel.getId(), alunoId);
        return aluno;
    }
}
