package br.com.brain.conteudo.dto;

import br.com.brain.conteudo.models.Conteudo;

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
