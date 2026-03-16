package br.com.brain.dto.conteudo;

import br.com.brain.domain.conteudo.Conteudo;

public record ListagemConteudoDto(
        Long id,
        String conteudo,
        String disciplina,
        String data) {

    public ListagemConteudoDto(Conteudo conteudo) {
        this(
                conteudo.getId(),
                conteudo.getConteudo(),
                conteudo.getAula().getDisciplina().getNome(),
                conteudo.getData().toString());
    }
}
