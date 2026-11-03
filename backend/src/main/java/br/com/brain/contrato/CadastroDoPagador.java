package br.com.brain.contrato;

import br.com.brain.responsavel.Responsavel;

import java.util.ArrayList;
import java.util.List;

/**
 * O que precisa estar preenchido no cadastro de quem paga.
 *
 * Nao e preciosismo de cadastro: boleto registrado e RECUSADO pelo banco sem
 * nome, CPF e endereco completo do pagador. O erro volta do banco em lote, dias
 * depois da emissao, quando a escola ja contava com aquele dinheiro -- e
 * corrigir ali significa reemitir boleto de familia que ja recebeu o anterior.
 *
 * Por isso a checagem fica na EFETIVACAO, e nao no cadastro do responsavel: o
 * CRM precisa continuar aceitando lead com telefone e nome, que e como o lead
 * chega. O cadastro so precisa estar completo no momento em que vira cobranca.
 *
 * Complemento fica de fora de proposito -- apartamento e bloco nao sao
 * obrigatorios no registro, e exigir travaria casa sem complemento.
 */
public final class CadastroDoPagador {

    private CadastroDoPagador() {
    }

    /**
     * Os campos que faltam, com o nome que a secretaria ve na tela. Lista vazia
     * significa cadastro pronto para cobrar.
     */
    public static List<String> oQueFalta(Responsavel responsavel) {
        var faltando = new ArrayList<String>();

        if (responsavel == null) {
            faltando.add("responsável financeiro");
            return faltando;
        }

        var dados = responsavel.getDadosPessoais();
        if (dados == null) {
            faltando.add("cadastro pessoal do responsável");
            return faltando;
        }

        exigir(faltando, dados.getNome(), "nome");
        exigir(faltando, dados.getCpf(), "CPF");

        var endereco = dados.getEndereco();
        if (endereco == null) {
            faltando.add("endereço");
            return faltando;
        }

        exigir(faltando, endereco.getLogradouro(), "logradouro");
        exigir(faltando, endereco.getNumero(), "número");
        exigir(faltando, endereco.getBairro(), "bairro");
        exigir(faltando, endereco.getCidade(), "cidade");
        exigir(faltando, endereco.getUf(), "UF");
        exigir(faltando, endereco.getCep(), "CEP");

        return faltando;
    }

    public static boolean podeCobrar(Responsavel responsavel) {
        return oQueFalta(responsavel).isEmpty();
    }

    /** Em branco conta como ausente: espaco em branco nao vira boleto. */
    private static void exigir(List<String> faltando, String valor, String rotulo) {
        if (valor == null || valor.isBlank()) {
            faltando.add(rotulo);
        }
    }
}
