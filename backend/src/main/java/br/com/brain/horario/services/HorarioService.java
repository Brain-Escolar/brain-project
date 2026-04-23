package br.com.brain.horario.services;

import br.com.brain.horario.domain.Horario;
import br.com.brain.horario.domain.HorarioRepository;
import br.com.brain.horario.dtos.AtualizacaoHorarioDto;
import br.com.brain.horario.dtos.CadastroHorarioDto;
import br.com.brain.horario.dtos.ListagemHorarioDto;
import br.com.brain.shared.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Horario cadastrarHorario(CadastroHorarioDto dados) {

        var horario = new Horario();
        horario.setNome(dados.nome());
        horario.setHorarioInicio(LocalTime.parse(dados.horarioInicio()));
        horario.setHorarioFim(LocalTime.parse(dados.horarioFim()));

        repository.save(horario);

        return horario;
    }

    public Page<ListagemHorarioDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemHorarioDto::new);
    }

    @Transactional
    public Horario atualizar(Long id, AtualizacaoHorarioDto dados) {
        var horario = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Horario", id));

        if (dados.nome() != null) {
            horario.setNome(dados.nome());
        }
        if (dados.horarioInicio() != null) {
            horario.setHorarioInicio(LocalTime.parse(dados.horarioInicio()));
        }
        if (dados.horarioFim() != null) {
            horario.setHorarioFim(LocalTime.parse(dados.horarioFim()));
        }
        repository.save(horario);

        return horario;
    }

    @Transactional
    public void excluir(Long id) {
        var horario = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Horario", id));
        repository.delete(horario);
    }

    public Horario detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Horario", id));
    }
}
