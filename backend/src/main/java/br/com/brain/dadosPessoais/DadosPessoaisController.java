package br.com.brain.dadosPessoais;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import br.com.brain.exception.ErrosSistema;

@RestController
@RequestMapping("dados-pessoais")
@RequiredArgsConstructor
public class DadosPessoaisController {

    private final DadosPessoaisService service;

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<DadosPessoais> buscarPorCpf(@PathVariable("cpf") String cpf) {
        var dadosPessoais = service.buscarDadosPessoaisPorCpf(cpf);
        return ResponseEntity.ok(dadosPessoais.orElseThrow(
                () -> ErrosSistema.RecursoNaoEncontradoException.para("Dados pessoais")));
    }

}
