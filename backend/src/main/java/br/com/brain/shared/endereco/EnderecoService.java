package br.com.brain.shared.endereco;

import br.com.brain.shared.endereco.Endereco;
import br.com.brain.shared.endereco.EnderecoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    public Endereco preencherEnderco(EnderecoDto dados) {
        var endereco = new Endereco();
        endereco.setLogradouro(dados.logradouro());
        endereco.setBairro(dados.bairro());
        endereco.setCep(dados.cep());
        endereco.setUf(dados.uf());
        endereco.setCidade(dados.cidade());
        endereco.setNumero(dados.numero());
        endereco.setComplemento(dados.complemento());
        return endereco;
    }

    public Endereco atualizarEndereco(Endereco endereco, EnderecoDto dados) {

        if (dados.logradouro() != null) {
            endereco.setLogradouro(dados.logradouro());
        }
        if (dados.bairro() != null) {
            endereco.setBairro(dados.bairro());
        }
        if (dados.cep() != null) {
            endereco.setCep(dados.cep());
        }
        if (dados.uf() != null) {
            endereco.setUf(dados.uf());
        }
        if (dados.cidade() != null) {
            endereco.setCidade(dados.cidade());
        }
        if (dados.numero() != null) {
            endereco.setNumero(dados.numero());
        }
        if (dados.complemento() != null) {
            endereco.setComplemento(dados.complemento());
        }

        return endereco;
    }
}
