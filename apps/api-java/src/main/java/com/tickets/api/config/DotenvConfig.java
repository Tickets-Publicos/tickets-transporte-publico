package com.tickets.api.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.lang.NonNull;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuração para carregar variáveis de ambiente do arquivo .env
 * Esta classe é executada antes da inicialização do Spring Boot
 */
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {
  @Override
  public void initialize(@NonNull ConfigurableApplicationContext applicationContext) {
    // Tenta encontrar o arquivo .env na raiz do projeto (dois níveis acima)
    Path currentDir = Paths.get("").toAbsolutePath();
    Path envFile = findEnvFile(currentDir);

    if (envFile != null && Files.exists(envFile)) {
      System.out.println("Carregando variáveis do arquivo: " + envFile.toString());

      try {
        Dotenv dotenv = Dotenv.configure()
            .directory(envFile.getParent().toString())
            .ignoreIfMissing()
            .load();

        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        Map<String, Object> envMap = new HashMap<>();

        // Adiciona todas as variáveis do .env ao environment do Spring
        dotenv.entries().forEach(entry -> {
          envMap.put(entry.getKey(), entry.getValue());
          System.setProperty(entry.getKey(), entry.getValue());
        });

        environment.getPropertySources()
            .addFirst(new MapPropertySource("dotenvProperties", envMap));

        System.out.println("Variáveis de ambiente carregadas com sucesso do .env");
      } catch (Exception e) {
        System.err.println("Erro ao carregar arquivo .env: " + e.getMessage());
      }
    } else {
      System.out.println("Arquivo .env não encontrado. Usando variáveis de ambiente do sistema.");
    }
  }

  /**
   * Procura o arquivo .env na raiz do projeto (monorepo)
   * Procura recursivamente até 3 níveis acima
   */
  private Path findEnvFile(Path currentDir) {
    Path envPath = currentDir.resolve(".env");

    // Verifica no diretório atual
    if (Files.exists(envPath)) {
      return envPath;
    }

    // Procura até 3 níveis acima (para estrutura de monorepo)
    Path searchDir = currentDir;
    for (int i = 0; i < 3; i++) {
      searchDir = searchDir.getParent();
      if (searchDir == null) {
        break;
      }

      envPath = searchDir.resolve(".env");
      if (Files.exists(envPath)) {
        return envPath;
      }
    }

    return null;
  }
}
