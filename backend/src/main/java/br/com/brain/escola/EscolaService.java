package br.com.brain.escola;
import br.com.brain.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.endereco.Endereco;
import br.com.brain.escola.dto.CadastroEscolaDto;
import br.com.brain.escola.dto.CadastroPrimeiroAdminDto;
import br.com.brain.escola.dto.DetalhamentoEscolaDto;
import br.com.brain.escola.dto.EscolaLoginDto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.infra.multitenancy.TenantFlywayMigrationService;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EscolaService {

    private final JdbcTemplate jdbcTemplate;

    private final TenantFlywayMigrationService flywayMigrationService;

    private final UsuarioService usuarioService;

    private final DadosAutenticacaoRepository dadosAutenticacaoRepository;

    public DetalhamentoEscolaDto cadastrar(CadastroEscolaDto dto) {
        String schema = gerarNomeSchema(dto.codigo());

        criarSchema(schema);
        flywayMigrationService.migrarTenant(schema);

        LocalDateTime agora = LocalDateTime.now();
        Long id = jdbcTemplate.queryForObject(
                "INSERT INTO public.escolas (nome, cnpj, codigo, schema_name, ativa, criada_em) " +
                        "VALUES (?, ?, ?, ?, true, ?) RETURNING id",
                Long.class,
                dto.nome(), dto.cnpj(), dto.codigo(), schema, agora);

        return new DetalhamentoEscolaDto(id, dto.nome(), dto.cnpj(), dto.codigo(), true, agora);
    }

    public String buscarSchemaPorCodigo(String codigo) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT schema_name FROM public.escolas WHERE codigo = ? AND ativa = true",
                    String.class,
                    codigo);
        } catch (EmptyResultDataAccessException e) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Escola", codigo);
        }
    }

    /** Escola dona do schema (tenant) informado — usada no cabeçalho dos documentos emitidos. */
    public Optional<DetalhamentoEscolaDto> buscarPorSchema(String schema) {
        return jdbcTemplate.queryForList(
                        "SELECT id, nome, cnpj, codigo, ativa, criada_em FROM public.escolas WHERE schema_name = ?",
                        schema)
                .stream()
                .findFirst()
                .map(this::mapToDto);
    }

    public void cadastrarPrimeiroAdmin(String codigoEscola, CadastroPrimeiroAdminDto dto) {
        var schema = buscarSchemaPorCodigo(codigoEscola);
        TenantContext.setTenantId(schema);

        if (dadosAutenticacaoRepository.count() > 0) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Esta escola já possui usuários cadastrados. Use o fluxo normal de criação de usuários.");
        }

        var endereco = new Endereco(dto.logradouro(), dto.bairro(), dto.cep(),
                dto.complemento(), dto.numero(), dto.uf(), dto.cidade());

        var dadosPessoais = new DadosPessoais();
        dadosPessoais.setNome(dto.nome());
        dadosPessoais.setNomeSocial(dto.nome());
        dadosPessoais.setEmail(dto.email());
        dadosPessoais.setEmailProfissional(dto.email());
        dadosPessoais.setCpf(dto.cpf());
        dadosPessoais.setDataDeNascimento(dto.dataDeNascimento());
        dadosPessoais.setEndereco(endereco);

        usuarioService.cadastrarUsuario(dadosPessoais, PerfilNome.ADMIN, dto.senha());
    }

    public List<DetalhamentoEscolaDto> listar() {
        return jdbcTemplate.queryForList("SELECT id, nome, cnpj, codigo, ativa, criada_em FROM public.escolas")
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /** TEMPORARIO: alimenta o seletor de escola do login. Remover junto com ele. */
    public List<EscolaLoginDto> listarAtivasParaLogin() {
        return jdbcTemplate.query(
                "SELECT codigo, nome FROM public.escolas WHERE ativa = true ORDER BY nome",
                (rs, rowNum) -> new EscolaLoginDto(rs.getString("codigo"), rs.getString("nome")));
    }

    private DetalhamentoEscolaDto mapToDto(Map<String, Object> row) {
        return new DetalhamentoEscolaDto(
                ((Number) row.get("id")).longValue(),
                (String) row.get("nome"),
                (String) row.get("cnpj"),
                (String) row.get("codigo"),
                (Boolean) row.get("ativa"),
                row.get("criada_em") != null
                        ? ((java.sql.Timestamp) row.get("criada_em")).toLocalDateTime()
                        : null);
    }

    private void criarSchema(String schema) {
        jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS \"" + schema + "\"");
    }

    private String gerarNomeSchema(String codigo) {
        return codigo.toLowerCase().replaceAll("[^a-z0-9]", "_");
    }
}
