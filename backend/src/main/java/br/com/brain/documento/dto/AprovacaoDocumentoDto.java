package br.com.brain.documento.dto;

import jakarta.validation.constraints.FutureOrPresent;

import java.time.LocalDate;

/** dataValidade e opcional: so para documentos que vencem (ex.: comprovante de residencia). */
public record AprovacaoDocumentoDto(
        @FutureOrPresent LocalDate dataValidade) {
}
