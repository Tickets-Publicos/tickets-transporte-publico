package com.tickets.api.annotation;

import com.tickets.api.model.enums.UserRole;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotação para especificar quais roles têm acesso a um endpoint.
 * Exemplo:
 * 
 * @RequireRole({UserRole.ADMIN})
 *                                public ResponseEntity<?> adminOnlyEndpoint() {
 *                                ... }
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
  UserRole[] value();
}
