package br.com.brain.dadosPessoais;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import br.com.brain.dadosPessoais.dto.PessoaExistenteDto;

@RestController
@RequestMapping("dados-pessoais")
@RequiredArgsConstructor
public class DadosPessoaisController {

    private final DadosPessoaisService service;

    /**
     * 200 com a pessoa (e os papeis que ja tem) ou 204 se ninguem tem esse
     * CPF/e-mail. Os formularios de cadastro chamam ao preencher o CPF.
     */
    @GetMapping("/existente")
    public ResponseEntity<PessoaExistenteDto> verificarExistente(
            @RequestParam(name = "cpf", required = false) String cpf,
            @RequestParam(name = "email", required = false) String email) {
        return service.verificarExistente(cpf, email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

}
