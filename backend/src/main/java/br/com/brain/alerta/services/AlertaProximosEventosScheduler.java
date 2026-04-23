package br.com.brain.alerta.services;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class AlertaProximosEventosScheduler {

    @Scheduled(cron = "0 15 12 * * ?")
    public void criarAlertasProximosEventos() {
        System.out.println("Iniciando verificação de próximos eventos nos calendários dos professores...");
    }
}
