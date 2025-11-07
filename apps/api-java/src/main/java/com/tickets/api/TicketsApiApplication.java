package com.tickets.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TicketsApiApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(TicketsApiApplication.class, args);
        Environment env = context.getEnvironment();
        String port = env.getProperty("server.port", "3000");
        System.out.println("[INFO] API rodando em http://localhost:" + port);
    }
}
