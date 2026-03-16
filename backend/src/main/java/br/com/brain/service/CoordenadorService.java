// package br.com.brain.service;

// import br.com.brain.dto.coordenador.AtualizacaoCoordenadorDto;
// import br.com.brain.dto.coordenador.CadastroCoordenadorDto;
// import br.com.brain.dto.coordenador.ListagemCoordenadorDto;
// import br.com.brain.enums.PerfilNome;
// import br.com.brain.domain.coordenador.Coordenador;
// import br.com.brain.domain.coordenador.CoordenadorRepository;
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
// public class CoordenadorService {

//     private final CoordenadorRepository repository;
//     private final EnderecoService enderecoService;
//     private final UsuarioService usuarioService;

//     @PersistenceContext
//     private EntityManager em;

//     @Transactional
//     public Coordenador cadastrarCoordenador(CadastroCoordenadorDto dados) {

//         var coordenador = new Coordenador();
//         coordenador.setCpf(dados.cpf());
//         coordenador.setNome(dados.nome());
//         coordenador.setEmail(dados.email());
//         coordenador.setEmailProfissional(dados.cpf() + "@email.com");
//         coordenador.setDataDeNascimento(dados.dataDeNascimento());
//         coordenador.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
//         coordenador.setRg(dados.rg());
//         coordenador.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());

//         usuarioService.cadastrarUsuario(
//                 coordenador.getNome(),
//                 PerfilNome.COORDENADOR,
//                 coordenador.getEmail(),
//                 coordenador.getEmailProfissional(),
//                 coordenador.getCpf());

//         repository.save(coordenador);

//         return coordenador;
//     }

//     public Page<ListagemCoordenadorDto> listar(Pageable paginacao) {
//         return repository.findAll(paginacao).map(ListagemCoordenadorDto::new);
//     }

//     @Transactional
//     public Coordenador atualizar(AtualizacaoCoordenadorDto dados, Long id) {
//         var coordenador = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Coordenador de id " + id + " não existe."));

//         if (dados.nome() != null) {
//             coordenador.setNome(dados.nome());
//         }
//         if (dados.dataDeNascimento() != null) {
//             coordenador.setDataDeNascimento(dados.dataDeNascimento());
//         }
//         if (dados.email() != null) {
//             coordenador.setEmail(dados.email());
//         }
//         if (dados.endereco() != null) {
//             var endereco = enderecoService.atualizarEndereco(coordenador.getEndereco(), dados.endereco());
//             coordenador.setEndereco(endereco);
//         }
//         if (dados.rg() != null) {
//             coordenador.setRg(dados.rg());
//         }
//         if (dados.carteiraDeTrabalho() != null) {
//             coordenador.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());
//         }

//         repository.save(coordenador);

//         return coordenador;
//     }

//     @Transactional
//     public void excluir(Long id) {
//         var coordenador = repository
//                 .findById(id)
//                 .orElseThrow(
//                         () -> new EntityNotFoundException("Coordenador de id " + id + " não existe."));
//         repository.delete(coordenador);
//     }

//     public Coordenador detalhar(Long id) {
//         return repository
//                 .findById(id)
//                 .orElseThrow(() -> new EntityNotFoundException("Coordenador de id " + id + " não existe."));
//     }
// }
