package br.com.brain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableAsync
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl", dateTimeProviderRef = "auditingDateTimeProvider")
public class BrainApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrainApplication.class, args);
    }
}
