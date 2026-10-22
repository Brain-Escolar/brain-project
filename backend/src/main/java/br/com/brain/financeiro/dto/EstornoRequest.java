package br.com.brain.financeiro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Desfaz uma baixa.
 *
 * O motivo e obrigatorio e nao e burocracia: estorno e a operacao que tira
 * dinheiro do caixa de um dia ja fechado, e seis meses depois alguem vai
 * perguntar por que. "Cheque devolvido", "baixa no aluno errado" e
 * "pagamento em duplicidade" sao respostas diferentes com consequencias
 * diferentes.
 */
public record EstornoRequest(

        @NotBlank(message = "O motivo do estorno é obrigatório.")
        @Size(min = 5, max = 255, message = "Explique o motivo do estorno em até 255 caracteres.")
        String motivo,

        /**
         * Emitir outra parcela no lugar. Omitido, SIM.
         *
         * O padrão é reemitir porque o título estornado não volta para ABERTO (ver
         * Titulo.estornar) — sem a reemissão a dívida simplesmente desaparece do
         * contas a receber, e ninguém descobre até o fim do ano.
         *
         * NÃO reemitir é o caso legítimo de baixa lançada no aluno errado: ali a
         * parcela certa já existe em outro contrato.
         */
        Boolean reemitir,

        /**
         * Vencimento da parcela reemitida. Omitido, mantém o vencimento original
         * se ele ainda não passou; se passou, usa hoje, para a família não receber
         * uma parcela que nasce vencida.
         */
        LocalDate novoVencimento) {

    public boolean deveReemitir() {
        return reemitir == null || reemitir;
    }
}
