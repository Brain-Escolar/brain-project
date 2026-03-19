package br.com.brain.service;

import br.com.brain.domain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.endereco.Endereco;
import br.com.brain.dto.escola.CadastroEscolaDto;
import br.com.brain.dto.escola.CadastroPrimeiroAdminDto;
import br.com.brain.dto.escola.DetalhamentoEscolaDto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.infra.multitenancy.TenantFlywayMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class EscolaService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TenantFlywayMigrationService flywayMigrationService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private DadosAutenticacaoRepository dadosAutenticacaoRepository;

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
