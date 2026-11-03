package br.com.brain.bolsa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * O motivo e obrigatorio e nao e burocracia: e o que a secretaria vai dizer a
 * familia, e em seis meses e a unica resposta para "por que aquele aluno nao
 * teve bolsa".
 */
public record RejeicaoBolsaRequest(

        @NotBlank(message = "O motivo da recusa é obrigatório.")
        @Size(min = 5, max = 255, message = "Explique o motivo em até 255 caracteres.")
        String motivo) {
}
