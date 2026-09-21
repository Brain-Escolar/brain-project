package br.com.brain.endereco;

import br.com.brain.endereco.dto.EnderecoDto;
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

        var alvo = endereco != null ? endereco : new Endereco();

        if (dados.logradouro() != null) {
            alvo.setLogradouro(dados.logradouro());
        }
        if (dados.bairro() != null) {
            alvo.setBairro(dados.bairro());
        }
        if (dados.cep() != null) {
            alvo.setCep(dados.cep());
        }
        if (dados.uf() != null) {
            alvo.setUf(dados.uf());
        }
        if (dados.cidade() != null) {
            alvo.setCidade(dados.cidade());
        }
        if (dados.numero() != null) {
            alvo.setNumero(dados.numero());
        }
        if (dados.complemento() != null) {
            alvo.setComplemento(dados.complemento());
        }

        return alvo;
    }
}
