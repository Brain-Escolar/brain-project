package br.com.brain.bolsa.dto;

import br.com.brain.bolsa.TipoBolsa;
import br.com.brain.produto.Produto;

import java.util.List;

/**
 * ATENCAO: ler produtoIds exige que a colecao venha carregada.
 *
 * TipoBolsa.produtos e LAZY, e os dois consumidores deste DTO montam a resposta
 * FORA de transacao. Por isso as duas consultas que alimentam este record fazem
 * fetch da colecao (listarAtivosComProdutos e listarTodosComProdutos) -- construir
 * este DTO a partir de um findAll() comum lanca LazyInitializationException na
 * serializacao.
 */
public record TipoBolsaDto(
        Long id,
        String codigo,
        String nome,
        Boolean estrutural,
        Boolean exigeComprovacao,
        Boolean contaParaCebas,
        Boolean acumulaComOutras,
        Boolean ativo,
        /**
         * Sobre quais produtos a bolsa incide. Vazio nao e detalhe: sem produto
         * elegivel o calculo do teto falha, porque nao ha valor cheio sobre o que
         * aplicar o percentual.
         */
        List<Long> produtoIds) {

    public TipoBolsaDto(TipoBolsa tipo) {
        this(tipo.getId(), tipo.getCodigo(), tipo.getNome(), tipo.getEstrutural(),
                tipo.getExigeComprovacao(), tipo.getContaParaCebas(), tipo.getAcumulaComOutras(),
                tipo.getAtivo(),
                tipo.getProdutos().stream().map(Produto::getId).toList());
    }
}
