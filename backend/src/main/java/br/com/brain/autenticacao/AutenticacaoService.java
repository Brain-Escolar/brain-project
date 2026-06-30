package br.com.brain.autenticacao;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import br.com.brain.exception.ErrosSistema;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AutenticacaoService implements UserDetailsService {

    private final DadosAutenticacaoRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository
                .findByEmailIgnoreCaseAndVerificadoTrue(username)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Usuário", username));
    }
}
