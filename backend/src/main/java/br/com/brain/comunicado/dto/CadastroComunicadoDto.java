package br.com.brain.comunicado.dto;

import br.com.brain.enums.ComunicadoCategoriaEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CadastroComunicadoDto(
        @NotBlank String titulo,
        @NotBlank String conteudo,
        @NotNull LocalDate data,
        ComunicadoCategoriaEnum categoria,
        String anexoUrl,
        @Valid List<DestinatarioComunicadoDto> destinatarios) {
}
