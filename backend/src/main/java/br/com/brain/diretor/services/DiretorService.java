// package br.com.brain.diretor.services;

// import br.com.brain.diretor.dtos.AtualizacaoDiretorDto;
// import br.com.brain.diretor.dtos.CadastroDiretorDto;
// import br.com.brain.diretor.dtos.ListagemDiretorDto;
// import br.com.brain.shared.enums.PerfilNome;
// import br.com.brain.diretor.domain.Diretor;
// import br.com.brain.diretor.domain.DiretorRepository;
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
// public class DiretorService {

//     private final DiretorRepository repository;
//     private final EnderecoService enderecoService;
//     private final UsuarioService usuarioService;

//     @PersistenceContext
//     private EntityManager em;

//     @Transactional
//     public Diretor cadastrarDiretor(CadastroDiretorDto dados) {

//         var diretor = new Diretor();
//         diretor.setCpf(dados.cpf());
//         diretor.setNome(dados.nome());
//         diretor.setEmail(dados.email());
//         diretor.setEmailProfissional(dados.cpf() + "@email.com");
//         diretor.setDataDeNascimento(dados.dataDeNascimento());
//         diretor.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
//         diretor.setRg(dados.rg());
//         diretor.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());

//         usuarioService.cadastrarUsuario(
//                 diretor.getNome(),
//                 PerfilNome.DIRETOR,
//                 diretor.getEmail(),
//                 diretor.getEmailProfissional(),
//                 diretor.getCpf());

//         repository.save(diretor);

//         return diretor;
//     }

//     public Page<ListagemDiretorDto> listar(Pageable paginacao) {
//         return repository.findAll(paginacao).map(ListagemDiretorDto::new);
//     }

//     @Transactional
//     public Diretor atualizar(AtualizacaoDiretorDto dados, Long id) {
//         var diretor = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Diretor de id " + id + " não existe."));

//         if (dados.nome() != null) {
//             diretor.setNome(dados.nome());
//         }
//         if (dados.dataDeNascimento() != null) {
//             diretor.setDataDeNascimento(dados.dataDeNascimento());
//         }
//         if (dados.email() != null) {
//             diretor.setEmail(dados.email());
//         }
//         if (dados.endereco() != null) {
//             var endereco = enderecoService.atualizarEndereco(diretor.getEndereco(), dados.endereco());
//             diretor.setEndereco(endereco);
//         }
//         if (dados.rg() != null) {
//             diretor.setRg(dados.rg());
//         }
//         if (dados.carteiraDeTrabalho() != null) {
//             diretor.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());
//         }

//         repository.save(diretor);

//         return diretor;
//     }

//     @Transactional
//     public void excluir(Long id) {
//         var diretor = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Diretor de id " + id + " não existe."));
//         repository.delete(diretor);
//     }

//     public Diretor detalhar(Long id) {
//         return repository
//                 .findById(id)
//                 .orElseThrow(() -> new EntityNotFoundException("Diretor de id " + id + " não existe."));
//     }
// }
