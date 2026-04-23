package br.com.brain.mock;

import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import br.com.brain.shared.infra.email.EmailService;

@TestConfiguration
public class EmailServiceTestConfig {

    @Bean
    @Primary
    public EmailService emailServiceMock() {
        return Mockito.mock(EmailService.class);
    }
}
