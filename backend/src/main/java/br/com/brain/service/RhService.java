// package br.com.brain.service;

// import br.com.brain.domain.rh.Rh;
// import br.com.brain.domain.rh.RhRepository;
// import br.com.brain.dto.rh.AtualizacaoRhDto;
// import br.com.brain.dto.rh.CadastroRhDto;
// import br.com.brain.dto.rh.ListagemRhDto;
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
// public class RhService {

//     private final RhRepository repository;
//     private final EnderecoService enderecoService;
//     private final UsuarioService usuarioService;

//     @PersistenceContext
//     private EntityManager em;

//     @Transactional
//     public Rh cadastrarRh(CadastroRhDto dados) {

//         var rh = new Rh();
//         rh.setCpf(dados.cpf());
//         rh.setNome(dados.nome());
//         rh.setEmail(dados.email());
//         rh.setEmailProfissional(dados.cpf() + "@email.com");
//         rh.setDataDeNascimento(dados.dataDeNascimento());
//         rh.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
//         rh.setRg(dados.rg());
//         rh.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());

//         usuarioService.cadastrarUsuario(
//                 rh.getNome(),
//                 PerfilNome.RECURSOS_HUMANOS,
//                 rh.getEmail(),
//                 rh.getEmailProfissional(),
//                 rh.getCpf());

//         repository.save(rh);

//         return rh;
//     }

//     public Page<ListagemRhDto> listar(Pageable paginacao) {
//         return repository.findAll(paginacao).map(ListagemRhDto::new);
//     }

//     @Transactional
//     public Rh atualizar(AtualizacaoRhDto dados, Long id) {
//         var rh = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Rh de id " + id + " não existe."));

//         if (dados.nome() != null) {
//             rh.setNome(dados.nome());
//         }
//         if (dados.dataDeNascimento() != null) {
//             rh.setDataDeNascimento(dados.dataDeNascimento());
//         }
//         if (dados.email() != null) {
//             rh.setEmail(dados.email());
//         }
//         if (dados.endereco() != null) {
//             var endereco = enderecoService.atualizarEndereco(rh.getEndereco(), dados.endereco());
//             rh.setEndereco(endereco);
//         }
//         if (dados.rg() != null) {
//             rh.setRg(dados.rg());
//         }
//         if (dados.carteiraDeTrabalho() != null) {
//             rh.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());
//         }

//         repository.save(rh);

//         return rh;
//     }

//     @Transactional
//     public void excluir(Long id) {
//         var rh = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Rh de id " + id + " não existe."));
//         repository.delete(rh);
//     }

//     public Rh detalhar(Long id) {
//         return repository
//                 .findById(id)
//                 .orElseThrow(() -> new EntityNotFoundException("Rh de id " + id + " não existe."));
//     }
// }
