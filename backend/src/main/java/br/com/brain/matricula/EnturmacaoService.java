package br.com.brain.matricula;

import br.com.brain.aluno.Aluno;
import br.com.brain.configuracaoAcademica.AnoLetivoAberto;
import br.com.brain.configuracaoAcademica.AnoLetivoService;
import br.com.brain.enums.StatusMatricula;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.turma.Turma;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.Optional;

/**
 * O único caminho que põe um aluno numa turma ou o tira dela.
 *
 * A fonte da verdade é a matrícula do ano da turma. {@code alunos.turma_id},
 * {@code serie_id} e {@code unidade_id} são só o cache da matrícula do ano
 * corrente, para as telas do dia a dia (portal, grade do aluno, comunicados)
 * não precisarem saber de ano letivo. Este serviço mantém os dois juntos:
 * quem gravar {@code aluno.setTurma} por fora volta a abrir a divergência que a
 * V114 fechou.
 */
@Service
@RequiredArgsConstructor
public class EnturmacaoService {

    private final MatriculaRepository matriculaRepository;
    private final AnoLetivoService anoLetivoService;

    /**
     * Põe o aluno na turma. Usa a matrícula viva do ano da turma quando existe
     * (remanejamento troca a turma dela); sem nenhuma, cria uma EFETIVADA — é o
     * caso da escola que enturma direto, sem passar pelo CRM.
     */
    @Transactional
    public Matricula enturmar(Aluno aluno, Turma turma) {
        int ano = turma.getAnoLetivo();
        anoLetivoService.garantir(ano);

        var matricula = matriculaViva(aluno.getId(), ano).orElseGet(() -> {
            var nova = new Matricula();
            nova.setAluno(aluno);
            nova.setAnoLetivo(ano);
            nova.setStatus(StatusMatricula.EFETIVADA);
            nova.setDataEfetivacao(LocalDate.now());
            return nova;
        });
        matricula.setTurma(turma);
        if (turma.getSerie() != null) {
            matricula.setSerie(turma.getSerie());
        }
        if (turma.getUnidade() != null) {
            matricula.setUnidade(turma.getUnidade());
        }
        if (turma.getTurno() != null) {
            matricula.setTurno(turma.getTurno());
        }
        if (matricula.getSerie() == null || matricula.getUnidade() == null) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A turma " + turma.getNome() + " não tem série e unidade definidas.");
        }
        matriculaRepository.save(matricula);

        if (ano == anoLetivoService.anoCorrente()) {
            aluno.setTurma(turma);
            aluno.setSerie(matricula.getSerie());
            aluno.setUnidade(matricula.getUnidade());
        }
        return matricula;
    }

    /** Tira o aluno da turma sem encerrar a matrícula: ele segue matriculado no ano, sem turma. */
    @Transactional
    public void desenturmar(Aluno aluno, Turma turma) {
        anoLetivoService.exigirEditavel(turma.getAnoLetivo());
        matriculaViva(aluno.getId(), turma.getAnoLetivo())
                .filter(m -> m.getTurma() != null && m.getTurma().getId().equals(turma.getId()))
                .ifPresent(m -> m.setTurma(null));

        if (aluno.getTurma() != null && aluno.getTurma().getId().equals(turma.getId())) {
            aluno.setTurma(null);
        }
    }

    /**
     * Saída do aluno da escola no ano corrente. A matrícula fica CANCELADA com
     * a turma preservada: até a data de saída ele estudou nela, e boletim e
     * histórico precisam disso.
     */
    @Transactional
    public void encerrarNoAnoCorrente(Aluno aluno, String motivo, LocalDate data) {
        matriculaViva(aluno.getId(), anoLetivoService.anoCorrente()).ifPresent(m -> {
            m.setStatus(StatusMatricula.CANCELADA);
            m.setDataSaida(data);
            m.setMotivoSaida(motivo);
        });
    }

    /**
     * Desfaz {@link #encerrarNoAnoCorrente}: a última matrícula cancelada do ano
     * volta a valer. Sem nenhuma, e com o aluno ainda apontando para uma turma do
     * ano, enturma de novo.
     */
    @Transactional
    public void reativarNoAnoCorrente(Aluno aluno) {
        int ano = anoLetivoService.anoCorrente();
        if (matriculaViva(aluno.getId(), ano).isPresent()) {
            return;
        }
        var cancelada = matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(aluno.getId(), ano).stream()
                .filter(m -> m.getStatus() == StatusMatricula.CANCELADA)
                .findFirst();
        if (cancelada.isPresent()) {
            var m = cancelada.get();
            m.setStatus(StatusMatricula.EFETIVADA);
            if (m.getDataEfetivacao() == null) {
                m.setDataEfetivacao(LocalDate.now());
            }
            m.setDataSaida(null);
            m.setMotivoSaida(null);
            return;
        }
        if (aluno.getTurma() != null && aluno.getTurma().getAnoLetivo() == ano) {
            enturmar(aluno, aluno.getTurma());
        }
    }

    /**
     * Acerta o cache de um aluno depois que algo de fora (efetivação do CRM)
     * gravou a matrícula diretamente.
     */
    @Transactional
    public void sincronizarCache(Aluno aluno) {
        matriculaViva(aluno.getId(), anoLetivoService.anoCorrente()).ifPresent(m -> {
            aluno.setTurma(m.getTurma());
            aluno.setSerie(m.getSerie());
            aluno.setUnidade(m.getUnidade());
        });
    }

    /** Ano novo aberto: o cache de todos os alunos passa a ser a matrícula dele. */
    @EventListener
    public void aoAbrirAno(AnoLetivoAberto evento) {
        matriculaRepository.sincronizarCacheDosAlunos(evento.ano());
    }

    private Optional<Matricula> matriculaViva(Long alunoId, int ano) {
        return matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(alunoId, ano).stream()
                .filter(m -> MatriculaRepository.VIVAS.contains(m.getStatus()))
                .max(Comparator.comparing(Matricula::getId));
    }
}
