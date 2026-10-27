package br.com.brain.infra.security;

import lombok.RequiredArgsConstructor;

import java.util.Arrays;

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
                            req.requestMatchers("/crm/**").hasRole("SECRETARIO");

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

                            // Contratos e efetivacao de matricula - acima do permitAll.
                            // Efetivar gera cobranca: e operacao de secretaria,
                            // nao de quem so consulta.
                            req.requestMatchers("/contratos/**")
                                    .hasAnyRole("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN");

                            // Baixa, estorno, caixa e inadimplencia - acima do
                            // permitAll. NAO confundir com /portal-responsavel:
                            // la e a familia vendo a propria conta, aqui e a
                            // escola mexendo no caixa. Prefixos separados de
                            // proposito, para um erro de matcher nao abrir o
                            // financeiro da escola para quem paga.
                            //
                            // FINANCEIRO ainda nao existe em PerfilNome; quando
                            // existir, entra aqui -- e dia em que vale rever se
                            // estorno continua acessivel a SECRETARIO, porque
                            // estorno tira dinheiro de um caixa ja fechado.
                            req.requestMatchers("/financeiro/**")
                                    .hasAnyRole("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN");

                            // Bolsas - acima do permitAll para ja valer hoje.
                            // FINANCEIRO ainda nao existe em PerfilNome; quando
                            // existir, entra aqui.
                            req.requestMatchers("/bolsas/**")
                                    .hasAnyRole("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN");

                            // Simulacoes financeiras - acima do permitAll para ja valer hoje.
                            // Escrita e da secretaria; a leitura inclui o
                            // responsavel, que precisa ver a propria proposta.
                            // Que seja a DELE e regra do servico, nao daqui:
                            // perfil diz quem entra, nao o que e de quem.
                            req.requestMatchers(HttpMethod.GET, "/simulacoes/**")
                                    .hasAnyRole("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN", "RESPONSAVEL");
                            req.requestMatchers("/simulacoes/**")
                                    .hasAnyRole("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN");

                            // Documentos de matricula - acima do permitAll para ja valer hoje.
                            // Dado pessoal de menor: professor fica de fora. A
                            // familia envia pelo /portal-responsavel.
                            req.requestMatchers("/documentos/**")
                                    .hasAnyRole("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN");

                            // Documentos escolares (boletim/historico) emitidos pela escola.
                            req.requestMatchers("/documentos-escolares/**")
                                    .hasAnyRole("SECRETARIO", "COORDENADOR", "DIRETOR", "ADMIN");

                            // Cadastro de secretarios - acima do permitAll para ja valer hoje.
                            // Criar secretario gera login com acesso a dados de
                            // alunos: e decisao de direcao.
                            req.requestMatchers("/secretario/**")
                                    .hasAnyRole("DIRETOR", "ADMIN");

                            // Telas da Direcao - acima do permitAll para ja valer hoje.
                            // Desempenho e comportamento da escola inteira.
                            req.requestMatchers("/diretor/**")
                                    .hasAnyRole("DIRETOR", "ADMIN");

                            // Anos letivos - acima do permitAll. Todo mundo logado
                            // le (o seletor de ano esta em todas as telas);
                            // abrir, encerrar e mexer no calendario e da Direcao.
                            req.requestMatchers(HttpMethod.GET, "/anos-letivos/**").authenticated();
                            req.requestMatchers("/anos-letivos/**")
                                    .hasAnyRole("DIRETOR", "ADMIN");

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
