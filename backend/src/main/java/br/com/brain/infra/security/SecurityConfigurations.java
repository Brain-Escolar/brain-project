package br.com.brain.infra.security;

import br.com.brain.permissao.PerfilOuTela;

import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfigurations {

    private final SecurityFilter securityFilter;
    private final PerfilOuTela perfilOuTela;

    // As areas da secretaria abaixo aceitam estes perfis OU quem tem uma das
    // telas que as usam liberada por grupo ou acesso individual
    // (docs/permissoes.md, D26). So libera: ninguem que entra hoje deixa de entrar.
    private static final List<String> GESTAO_DA_SECRETARIA = List.of("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN");

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.cors(Customizer.withDefaults()).csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(
                        req -> {
                            // Swagger
                            req.requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**")
                                    .permitAll();

                            // Paginas de login
                            req.requestMatchers("/login/**", "/atualizar-token", "/usuario/**").permitAll();

                            // Portal do Responsavel - acima do permitAll para ja valer hoje.
                            req.requestMatchers("/portal-responsavel/**").hasRole("RESPONSAVEL");

                            // CRM de matriculas - acima do permitAll para ja valer hoje.
                            req.requestMatchers("/crm/**").access(perfilOuTela.regra(List.of("SECRETARIO"), "SECRETARIA_CRM"));

                            // Configuracao de bolsa - ANTES de /bolsas/** DE PROPOSITO.
                            //
                            // A ordem aqui e a propria regra: o Spring Security
                            // casa o PRIMEIRO matcher que bate. Se /bolsas/**
                            // viesse antes, ele casaria /bolsas/configuracao
                            // tambem e uma secretaria poderia reescrever a matriz
                            // de descontos -- as linhas abaixo nunca seriam
                            // consultadas. Nao reordenar.
                            //
                            // Escrever configuracao decide quanto a escola deixa
                            // de arrecadar no ano: e decisao de direcao. Ler e mais
                            // largo, porque a tela de matricula precisa explicar
                            // qual regra segurou a bolsa.
                            req.requestMatchers(HttpMethod.GET, "/bolsas/configuracao/**")
                                    .hasAnyRole("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN");
                            req.requestMatchers("/bolsas/configuracao/**")
                                    .hasAnyRole("DIRETOR", "ADMIN");

                            // Bolsas - acima do permitAll para ja valer hoje.
                            // FINANCEIRO ainda nao existe em PerfilNome; quando
                            // existir, entra aqui.
                            // A tela que usa bolsas e simulacoes e o bloco de bolsa do CRM.
                            req.requestMatchers("/bolsas/**")
                                    .access(perfilOuTela.regra(GESTAO_DA_SECRETARIA, "SECRETARIA_CRM"));

                            // Simulacoes financeiras - acima do permitAll para ja valer hoje.
                            // Escrita e da secretaria; a leitura inclui o
                            // responsavel, que precisa ver a propria proposta.
                            // Que seja a DELE e regra do servico, nao daqui:
                            // perfil diz quem entra, nao o que e de quem.
                            req.requestMatchers(HttpMethod.GET, "/simulacoes/**")
                                    .access(perfilOuTela.regra(
                                            List.of("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN", "RESPONSAVEL"),
                                            "SECRETARIA_CRM"));
                            req.requestMatchers("/simulacoes/**")
                                    .access(perfilOuTela.regra(GESTAO_DA_SECRETARIA, "SECRETARIA_CRM"));

                            // Documentos de matricula - acima do permitAll para ja valer hoje.
                            // Dado pessoal de menor: professor fica de fora. A
                            // familia envia pelo /portal-responsavel.
                            // Telas que chamam: validacao (documentos), matriculas e CRM
                            // (dialogo de documentacao do aluno).
                            req.requestMatchers("/documentos/**")
                                    .access(perfilOuTela.regra(GESTAO_DA_SECRETARIA, "SECRETARIA_DOCUMENTOS",
                                            "SECRETARIA_MATRICULAS", "SECRETARIA_CRM"));

                            // Documentos escolares (boletim/historico) emitidos pela escola.
                            req.requestMatchers("/documentos-escolares/**")
                                    .access(perfilOuTela.regra(GESTAO_DA_SECRETARIA, "SECRETARIA_DOCUMENTOS"));

                            // Grupos de acesso - acima do permitAll para ja valer hoje.
                            // Diretor e Admin montam os grupos. Os acessos configurados
                            // valem no frontend e nas regras "perfil ou tela" acima; o
                            // bloqueio no resto do backend e a fase F3 (docs/permissoes.md).
                            req.requestMatchers("/grupos-usuarios", "/grupos-usuarios/**", "/permissoes/catalogo")
                                    .hasAnyRole("DIRETOR", "ADMIN");
                            // Permissões de quem está logado: qualquer perfil, mas com login.
                            req.requestMatchers("/permissoes/me").authenticated();

                            // Remover depois
                            req.requestMatchers("/**").permitAll();

                            // Orientacao
                            req.requestMatchers("/orientacao/**").hasRole("ORIENTADOR");

                            // Comunicado
                            req.requestMatchers(HttpMethod.GET, "/comunicado/**")
                                    .hasAnyRole("ESTUDANTE", "RESPONSAVEL", "PROFESSOR", "SECRETARIO", "ORIENTADOR",
                                            "ADMIN");
                            req.requestMatchers(HttpMethod.POST, "/comunicado/**")
                                    .hasAnyRole("SECRETARIO", "ORIENTADOR");
                            req.requestMatchers(HttpMethod.PUT, "/comunicado/**")
                                    .hasAnyRole("SECRETARIO", "ORIENTADOR");
                            req.requestMatchers(HttpMethod.DELETE, "/comunicado/**")
                                    .hasAnyRole("SECRETARIO", "ORIENTADOR");

                            // Holerite / Informe de rendimentos (contracheque e declarações)
                            req.requestMatchers(HttpMethod.POST, "/holerite/**")
                                    .hasAnyRole("RECURSOS_HUMANOS", "ADMIN");
                            req.requestMatchers(HttpMethod.GET, "/holerite/**").hasRole("PROFESSOR");
                            req.requestMatchers(HttpMethod.POST, "/informe-rendimento/**")
                                    .hasAnyRole("RECURSOS_HUMANOS", "ADMIN");
                            req.requestMatchers(HttpMethod.GET, "/informe-rendimento/**").hasRole("PROFESSOR");

                            // Material complementar
                            req.requestMatchers(HttpMethod.POST, "/material-complementar/**").hasRole("PROFESSOR");
                            req.requestMatchers(HttpMethod.GET, "/material-complementar/**").hasRole("PROFESSOR");
                            req.requestMatchers(HttpMethod.DELETE, "/material-complementar/**").hasRole("PROFESSOR");

                            // Aluno
                            req.requestMatchers(HttpMethod.POST, "/aluno/**").hasRole("SECRETARIO");
                            req.requestMatchers(HttpMethod.GET, "/aluno/**")
                                    .hasAnyRole("SECRETARIO", "PROFESSOR", "ESTUDANTE", "ORIENTADOR");
                            req.requestMatchers(HttpMethod.PUT, "/aluno/**")
                                    .hasAnyRole("SECRETARIO", "ESTUDANTE");
                            req.requestMatchers(HttpMethod.DELETE, "/aluno/**").hasRole("SECRETARIO");
                            // Anotacao
                            // Aula
                            // Autenticacao
                            // Disciplina
                            // GradeHoraria
                            // GrupoDisciplina
                            // Horario
                            // Notas
                            // Professor
                            // Responsavel
                            // Serie
                            // Turma
                            // Unidade

                            // Usuario
                            // req.requestMatchers(HttpMethod.POST, "usuario/**").hasRole("SECRETARIO");
                            // req.requestMatchers(HttpMethod.GET,
                            // "usuario/**").hasAnyRole("SECRETARIO",
                            // "PROFESSOR", "ESTUDANTE");
                            // req.requestMatchers(HttpMethod.PUT,
                            // "usuario/**").hasAnyRole("SECRETARIO",
                            // "ESTUDANTE");
                            // req.requestMatchers(HttpMethod.DELETE,
                            // "usuario/**").hasRole("SECRETARIO");

                            req.anyRequest().authenticated();
                        })
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("*"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
            throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        String hierarquia = "ROLE_ADMIN > ROLE_DIRETOR\n"
                + "ROLE_DIRETOR > ROLE_SECRETARIO\n"
                + "ROLE_SECRETARIO > ROLE_COORDENADOR\n"
                + "ROLE_DIRETOR > ROLE_ORIENTADOR\n"
                + "ROLE_ADMIN > ROLE_PROFESSOR\n"
                + "ROLE_ADMIN > ROLE_ESTUDANTE\n"
                + "ROLE_ADMIN > ROLE_RECURSOS_HUMANOS\n";
        return RoleHierarchyImpl.fromHierarchy(hierarquia);
    }
}
