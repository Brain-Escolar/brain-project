package br.com.brain.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import br.com.brain.domain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.exception.ErrosSistema;

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private DadosAutenticacaoRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository
                .findByEmailIgnoreCaseAndVerificadoTrue(username)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Usuário", username));
    }
}
