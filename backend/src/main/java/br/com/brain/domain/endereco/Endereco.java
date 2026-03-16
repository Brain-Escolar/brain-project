package br.com.brain.domain.endereco;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Endereco {

    private String logradouro;
    private String bairro;
    private String cep;
    private String complemento;
    private String numero;
    private String uf;
    private String cidade;
}
