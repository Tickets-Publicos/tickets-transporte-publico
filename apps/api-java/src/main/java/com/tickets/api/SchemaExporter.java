package com.tickets.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Utility to export JPA schema to SQL file.
 * Generates the DDL to src/main/resources/db/changelog/jpa_create.sql
 */
@SpringBootApplication
public class SchemaExporter {

    public static void main(String[] args) {
        // Ensure we don't start a web server
        System.setProperty("spring.main.web-application-type", "none");
        // Disable Flyway while exporting schema
        System.setProperty("spring.flyway.enabled", "false");
        // Prevent Hibernate from touching the database
        System.setProperty("spring.jpa.hibernate.ddl-auto", "none");

        // JPA schema generation to script (Jakarta Persistence 3.x keys)
        System.setProperty("spring.jpa.properties.jakarta.persistence.schema-generation.database.action", "none");
        System.setProperty("spring.jpa.properties.jakarta.persistence.schema-generation.scripts.action", "create");
        System.setProperty(
                "spring.jpa.properties.jakarta.persistence.schema-generation.scripts.create-target",
                "src/main/resources/db/changelog/jpa_create.sql"
        );
        System.setProperty("spring.jpa.properties.jakarta.persistence.schema-generation.create-source", "metadata");

        SpringApplication.run(SchemaExporter.class, args);

        // Exit after schema generation
        System.exit(0);
    }
}
