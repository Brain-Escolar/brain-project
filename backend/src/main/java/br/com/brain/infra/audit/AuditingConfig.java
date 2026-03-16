package br.com.brain.infra.audit;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

@Configuration
public class AuditingConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean("auditingDateTimeProvider")
    public DateTimeProvider dateTimeProvider(Clock clock) {
        return () -> Optional.of(Instant.now(clock));
    }
}
