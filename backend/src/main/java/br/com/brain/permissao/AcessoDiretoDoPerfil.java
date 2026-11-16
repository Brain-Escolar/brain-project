package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;

import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * O que cada perfil abre direto no servidor, sem grupo: as regras por perfil
 * do SecurityConfigurations (D26), que valem acima do permitAll. A tela de
 * Usuários mostra esta lista à parte do que vem dos grupos, e o diálogo de
 * conceder perfil avisa o que ele traz (RU10).
 *
 * É um espelho do SecurityConfigurations, escrito à mão: ao mudar uma regra
 * por perfil lá, mude aqui também. A hierarquia é a do roleHierarchy de lá (o
 * diretor entra onde a secretaria entra).
 */
public final class AcessoDiretoDoPerfil {

    /** sensivel marca dado pessoal de aluno ou de família. */
    public record Area(String nome, String detalhe, boolean sensivel, Set<PerfilNome> perfis) {
    }

    private static final Set<PerfilNome> GESTAO_DA_SECRETARIA = EnumSet.of(PerfilNome.SECRETARIO,
            PerfilNome.COORDENADOR, PerfilNome.DIRETOR, PerfilNome.ADMIN);
    private static final Set<PerfilNome> GESTAO_E_FINANCEIRO = EnumSet.of(PerfilNome.SECRETARIO,
            PerfilNome.COORDENADOR, PerfilNome.DIRETOR, PerfilNome.ADMIN, PerfilNome.FINANCEIRO);
    private static final Set<PerfilNome> DIRECAO = EnumSet.of(PerfilNome.DIRETOR, PerfilNome.ADMIN);
    private static final Set<PerfilNome> FINANCEIRO_E_DIRECAO = EnumSet.of(PerfilNome.FINANCEIRO,
            PerfilNome.DIRETOR, PerfilNome.ADMIN);

    private static final List<Area> AREAS = List.of(
            new Area("Portal do responsável", "a conta e os filhos da própria família", false,
                    EnumSet.of(PerfilNome.RESPONSAVEL)),
            new Area("CRM de matrículas", "leads, interações e distribuição da fila", false,
                    EnumSet.of(PerfilNome.SECRETARIO)),
            new Area("Contratos e efetivação de matrícula", "gera as cobranças do ano", false, GESTAO_E_FINANCEIRO),
            new Area("Financeiro", "baixa de pagamento, caixa e inadimplência", false, GESTAO_E_FINANCEIRO),
            new Area("Estorno de pagamento", "tira dinheiro de um caixa que pode já estar fechado", false,
                    FINANCEIRO_E_DIRECAO),
            new Area("Bolsas", "pedidos e aprovação de bolsa", false, GESTAO_E_FINANCEIRO),
            new Area("Configuração de bolsas", "alterar a matriz de descontos", false, DIRECAO),
            new Area("Simulações financeiras", "propostas de matrícula", false, GESTAO_E_FINANCEIRO),
            new Area("Catálogo e tabela de preços", "produtos e preços", false, GESTAO_E_FINANCEIRO),
            new Area("Aprovação de preços", "decide o preço que a proposta usa", false, FINANCEIRO_E_DIRECAO),
            new Area("Documentos de matrícula", "documentos pessoais de alunos e famílias", true,
                    GESTAO_DA_SECRETARIA),
            new Area("Documentos escolares", "boletim e histórico", false, GESTAO_DA_SECRETARIA),
            new Area("Busca de pessoa por CPF ou e-mail", "devolve o dado pessoal completo", true,
                    GESTAO_DA_SECRETARIA),
            new Area("Grupos de acesso", "monta os grupos e os acessos de cada perfil", false, DIRECAO),
            new Area("Usuários", "todas as seções desta tela", false, DIRECAO),
            new Area("Cadastro de secretários", "cria login com acesso a dados de alunos", false, DIRECAO),
            new Area("Painéis da direção", "desempenho e comportamento da escola inteira", false, DIRECAO),
            new Area("Anos letivos", "abrir, encerrar e mexer no calendário", false, DIRECAO));

    /** Quem está acima herda o que está abaixo (SecurityConfigurations.roleHierarchy). */
    private static final Map<PerfilNome, Set<PerfilNome>> HERDA = Map.of(
            PerfilNome.ADMIN, EnumSet.of(PerfilNome.DIRETOR, PerfilNome.PROFESSOR, PerfilNome.ESTUDANTE,
                    PerfilNome.RECURSOS_HUMANOS),
            PerfilNome.DIRETOR, EnumSet.of(PerfilNome.SECRETARIO, PerfilNome.ORIENTADOR),
            PerfilNome.SECRETARIO, EnumSet.of(PerfilNome.COORDENADOR));

    private AcessoDiretoDoPerfil() {
    }

    public static List<Area> de(PerfilNome perfil) {
        var alcancados = alcancados(perfil);
        return AREAS.stream()
                .filter(area -> area.perfis().stream().anyMatch(alcancados::contains))
                .toList();
    }

    static Set<PerfilNome> alcancados(PerfilNome perfil) {
        var resultado = EnumSet.of(perfil);
        for (var abaixo : HERDA.getOrDefault(perfil, Set.of())) {
            resultado.addAll(alcancados(abaixo));
        }
        return resultado;
    }
}
