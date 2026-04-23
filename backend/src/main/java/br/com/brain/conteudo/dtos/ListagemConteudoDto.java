package br.com.brain.conteudo.dtos;

import br.com.brain.conteudo.domain.Conteudo;

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
