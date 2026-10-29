package br.com.brain.permissao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Leitura das tabelas _AUD do grupo e dos três vínculos dele (V111).
 *
 * SQL direto, e não AuditReader: o histórico junta quatro entidades por
 * revisão e precisa paginar pelas revisões, não pelas linhas. Os nomes vêm
 * das tabelas atuais: o catálogo só muda por migration e o sistema não apaga
 * pessoas.
 *
 * A ordem é pela data da revisão, e o número só desempata: a sequência da
 * revinfo reserva blocos de 50 por instância, então número maior não quer
 * dizer alteração mais recente.
 */
@Repository
@RequiredArgsConstructor
public class HistoricoGrupoUsuarioRepository {

    /** Revtype do Envers: 0 criou, 1 alterou, 2 removeu. */
    static final int CRIADO = 0;
    static final int REMOVIDO = 2;

    private static final String REVISOES_DO_GRUPO = """
            select rev from grupos_usuarios_AUD where id = :grupoId
            union select rev from grupos_usuarios_telas_AUD where grupo_usuario_id = :grupoId
            union select rev from grupos_usuarios_controles_AUD where grupo_usuario_id = :grupoId
            union select rev from dados_pessoais_grupos_usuarios_AUD where grupo_usuario_id = :grupoId
            """;

    private static final String NOME_DA_PESSOA = "coalesce(nullif(trim(dp.nome_social), ''), dp.nome)";

    private final NamedParameterJdbcTemplate jdbc;

    public record Revisao(long rev, Instant data, Long autorId, String autorNome) {
    }

    /** Estado do grupo gravado numa revisão. */
    public record EstadoGrupo(long rev, int tipo, String nome, String descricao, Boolean ativo) {
    }

    /** Tela, controle ou pessoa que entrou ou saiu do grupo numa revisão. */
    public record Vinculo(long rev, int tipo, String chave, String nome) {

        static Vinculo de(ResultSet rs, int linha) throws SQLException {
            return new Vinculo(rs.getLong("rev"), rs.getInt("revtype"), rs.getString("chave"), rs.getString("nome"));
        }
    }

    public long contarRevisoes(Long grupoId) {
        var total = jdbc.queryForObject("select count(*) from (" + REVISOES_DO_GRUPO + ") r",
                Map.of("grupoId", grupoId), Long.class);
        return total == null ? 0 : total;
    }

    /** Página de revisões que mexeram no grupo, da mais recente para a mais antiga. */
    public List<Revisao> buscarRevisoes(Long grupoId, int limite, long inicio) {
        return jdbc.query("""
                select r.rev, r.revtstmp, r.usuario_id, %s as autor
                from revinfo r
                left join dados_pessoais dp on dp.id = r.usuario_id
                where r.rev in (%s)
                order by r.revtstmp desc, r.rev desc
                limit :limite offset :inicio
                """.formatted(NOME_DA_PESSOA, REVISOES_DO_GRUPO),
                Map.of("grupoId", grupoId, "limite", limite, "inicio", inicio),
                (rs, i) -> new Revisao(
                        rs.getLong("rev"),
                        Instant.ofEpochMilli(rs.getLong("revtstmp")),
                        rs.getObject("usuario_id", Long.class),
                        rs.getString("autor")));
    }

    /**
     * Todas as versões do grupo, da mais antiga para a mais recente. É pouca
     * coisa (só nome, descrição e situação mudam) e o diff de uma revisão
     * precisa da anterior, que pode estar em outra página.
     */
    public List<EstadoGrupo> buscarEstados(Long grupoId) {
        return jdbc.query("""
                select a.rev, a.revtype, a.nome, a.descricao, a.ativo
                from grupos_usuarios_AUD a
                join revinfo r on r.rev = a.rev
                where a.id = :grupoId
                order by r.revtstmp, a.rev
                """, Map.of("grupoId", grupoId),
                (rs, i) -> new EstadoGrupo(
                        rs.getLong("rev"),
                        rs.getInt("revtype"),
                        rs.getString("nome"),
                        rs.getString("descricao"),
                        rs.getObject("ativo", Boolean.class)));
    }

    public List<Vinculo> buscarTelas(Long grupoId, Collection<Long> revs) {
        return jdbc.query("""
                select a.rev, a.revtype, t.codigo as chave, t.nome
                from grupos_usuarios_telas_AUD a
                join telas t on t.id = a.tela_id
                where a.grupo_usuario_id = :grupoId and a.rev in (:revs) and a.revtype <> 1
                order by t.nome
                """, Map.of("grupoId", grupoId, "revs", revs), Vinculo::de);
    }

    public List<Vinculo> buscarControles(Long grupoId, Collection<Long> revs) {
        return jdbc.query("""
                select a.rev, a.revtype, c.codigo as chave, c.nome
                from grupos_usuarios_controles_AUD a
                join controles c on c.id = a.controle_id
                where a.grupo_usuario_id = :grupoId and a.rev in (:revs) and a.revtype <> 1
                order by c.nome
                """, Map.of("grupoId", grupoId, "revs", revs), Vinculo::de);
    }

    public List<Vinculo> buscarMembros(Long grupoId, Collection<Long> revs) {
        return jdbc.query("""
                select a.rev, a.revtype, cast(dp.id as varchar(20)) as chave, %s as nome
                from dados_pessoais_grupos_usuarios_AUD a
                join dados_pessoais dp on dp.id = a.dados_pessoais_id
                where a.grupo_usuario_id = :grupoId and a.rev in (:revs) and a.revtype <> 1
                order by 4
                """.formatted(NOME_DA_PESSOA), Map.of("grupoId", grupoId, "revs", revs), Vinculo::de);
    }
}
