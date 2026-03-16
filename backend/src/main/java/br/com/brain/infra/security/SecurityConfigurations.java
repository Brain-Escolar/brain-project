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

                            // Remover depois
                            req.requestMatchers("/**").permitAll();

                            // Aluno
                            req.requestMatchers(HttpMethod.POST, "/aluno/**").hasRole("SECRETARIO");
                            req.requestMatchers(HttpMethod.GET, "/aluno/**")
                                    .hasAnyRole("SECRETARIO", "PROFESSOR", "ESTUDANTE");
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
                + "ROLE_ADMIN > ROLE_PROFESSOR\n"
                + "ROLE_ADMIN > ROLE_ESTUDANTE\n";
        return RoleHierarchyImpl.fromHierarchy(hierarquia);
    }
}
