// package br.com.brain.service;

// import br.com.brain.domain.secretario.Secretario;
// import br.com.brain.domain.secretario.SecretarioRepository;
// import br.com.brain.dto.secretario.AtualizacaoSecretarioDto;
// import br.com.brain.dto.secretario.CadastroSecretarioDto;
// import br.com.brain.dto.secretario.ListagemSecretarioDto;
// import br.com.brain.enums.PerfilNome;
// import jakarta.persistence.EntityManager;
// import jakarta.persistence.EntityNotFoundException;
// import jakarta.persistence.PersistenceContext;
// import jakarta.transaction.Transactional;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.stereotype.Service;

// @Service
// @RequiredArgsConstructor
// public class SecretarioService {

//     private final SecretarioRepository repository;
//     private final EnderecoService enderecoService;
//     private final UsuarioService usuarioService;

//     @PersistenceContext
//     private EntityManager em;

//     @Transactional
//     public Secretario cadastrarSecretario(CadastroSecretarioDto dados) {

//         var secretario = new Secretario();
//         secretario.setCpf(dados.cpf());
//         secretario.setNome(dados.nome());
//         secretario.setEmail(dados.email());
//         secretario.setEmailProfissional(dados.cpf() + "@email.com");
//         secretario.setDataDeNascimento(dados.dataDeNascimento());
//         secretario.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
//         secretario.setRg(dados.rg());
//         secretario.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());

//         usuarioService.cadastrarUsuario(
//                 secretario.getNome(),
//                 PerfilNome.SECRETARIO,
//                 secretario.getEmail(),
//                 secretario.getEmailProfissional(),
//                 secretario.getCpf());

//         repository.save(secretario);

//         return secretario;
//     }

//     public Page<ListagemSecretarioDto> listar(Pageable paginacao) {
//         return repository.findAll(paginacao).map(ListagemSecretarioDto::new);
//     }

//     @Transactional
//     public Secretario atualizar(AtualizacaoSecretarioDto dados, Long id) {
//         var secretario = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Secretario de id " + id + " não existe."));

//         if (dados.nome() != null) {
//             secretario.setNome(dados.nome());
//         }
//         if (dados.dataDeNascimento() != null) {
//             secretario.setDataDeNascimento(dados.dataDeNascimento());
//         }
//         if (dados.email() != null) {
//             secretario.setEmail(dados.email());
//         }
//         if (dados.endereco() != null) {
//             var endereco = enderecoService.atualizarEndereco(secretario.getEndereco(), dados.endereco());
//             secretario.setEndereco(endereco);
//         }
//         if (dados.rg() != null) {
//             secretario.setRg(dados.rg());
//         }
//         if (dados.carteiraDeTrabalho() != null) {
//             secretario.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());
//         }

//         repository.save(secretario);

//         return secretario;
//     }

//     @Transactional
//     public void excluir(Long id) {
//         var secretario = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Secretario de id " + id + " não existe."));
//         repository.delete(secretario);
//     }

//     public Secretario detalhar(Long id) {
//         return repository
//                 .findById(id)
//                 .orElseThrow(() -> new EntityNotFoundException("Secretario de id " + id + " não existe."));
//     }
// }
