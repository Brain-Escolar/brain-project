package br.com.brain.aluno;

import br.com.brain.enums.PerfilNome;

public class AlunoViews {
    public interface Publico {}
    public interface Administrativo extends Publico {}

    public static Class<?> paraPerfil(PerfilNome perfil) {
        return perfil == PerfilNome.PROFESSOR ? Publico.class : Administrativo.class;
    }
}
