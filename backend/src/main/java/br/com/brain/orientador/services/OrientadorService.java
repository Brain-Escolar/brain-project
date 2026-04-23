// package br.com.brain.orientador.services;

// import br.com.brain.orientador.dtos.AtualizacaoOrientadorDto;
// import br.com.brain.orientador.dtos.CadastroOrientadorDto;
// import br.com.brain.orientador.dtos.ListagemOrientadorDto;
// import br.com.brain.shared.enums.PerfilNome;
// import br.com.brain.orientador.domain.Orientador;
// import br.com.brain.orientador.domain.OrientadorRepository;
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
// public class OrientadorService {

//     private final OrientadorRepository repository;
//     private final EnderecoService enderecoService;
//     private final UsuarioService usuarioService;

//     @PersistenceContext
//     private EntityManager em;

//     @Transactional
//     public Orientador cadastrarOrientador(CadastroOrientadorDto dados) {

//         var orientador = new Orientador();
//         orientador.setCpf(dados.cpf());
//         orientador.setNome(dados.nome());
//         orientador.setEmail(dados.email());
//         orientador.setEmailProfissional(dados.cpf() + "@email.com");
//         orientador.setDataDeNascimento(dados.dataDeNascimento());
//         orientador.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
//         orientador.setRg(dados.rg());
//         orientador.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());

//         usuarioService.cadastrarUsuario(
//                 orientador.getNome(),
//                 PerfilNome.ORIENTADOR,
//                 orientador.getEmail(),
//                 orientador.getEmailProfissional(),
//                 orientador.getCpf());

//         repository.save(orientador);

//         return orientador;
//     }

//     public Page<ListagemOrientadorDto> listar(Pageable paginacao) {
//         return repository.findAll(paginacao).map(ListagemOrientadorDto::new);
//     }

//     @Transactional
//     public Orientador atualizar(AtualizacaoOrientadorDto dados, Long id) {
//         var orientador = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Orientador de id " + id + " não existe."));

//         if (dados.nome() != null) {
//             orientador.setNome(dados.nome());
//         }
//         if (dados.dataDeNascimento() != null) {
//             orientador.setDataDeNascimento(dados.dataDeNascimento());
//         }
//         if (dados.email() != null) {
//             orientador.setEmail(dados.email());
//         }
//         if (dados.endereco() != null) {
//             var endereco = enderecoService.atualizarEndereco(orientador.getEndereco(), dados.endereco());
//             orientador.setEndereco(endereco);
//         }
//         if (dados.rg() != null) {
//             orientador.setRg(dados.rg());
//         }
//         if (dados.carteiraDeTrabalho() != null) {
//             orientador.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());
//         }

//         repository.save(orientador);

//         return orientador;
//     }

//     @Transactional
//     public void excluir(Long id) {
//         var orientador = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Orientador de id " + id + " não existe."));
//         repository.delete(orientador);
//     }

//     public Orientador detalhar(Long id) {
//         return repository
//                 .findById(id)
//                 .orElseThrow(() -> new EntityNotFoundException("Orientador de id " + id + " não existe."));
//     }
// }
