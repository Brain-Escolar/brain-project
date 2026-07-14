package br.com.brain.aluno;

import java.util.Collections;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonView;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.exception.ErrosSistema;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@ControllerAdvice
public class AlunoViewResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return returnType.hasMethodAnnotation(PerfilAlunoView.class);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request, ServerHttpResponse response) {
        return body;
    }

    @Override
    public Map<String, Object> determineWriteHints(Object body, MethodParameter returnType,
            MediaType selectedContentType, Class<? extends HttpMessageConverter<?>> selectedConverterType) {
        var usuario = (DadosAutenticacao) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var perfil = usuario.getDadosPessoais().getPerfis().stream()
                .findFirst()
                .map(p -> p.getNome())
                .orElseThrow(() -> ErrosSistema.OperacaoInvalidaException.com("Usuário sem perfil definido."));
        return Collections.singletonMap(JsonView.class.getName(), AlunoViews.paraPerfil(perfil));
    }
}
