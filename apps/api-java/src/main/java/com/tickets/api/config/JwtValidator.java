package com.tickets.api.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtValidator {

  @Value("${jwt.secret}")
  private String jwtSecret;

  /**
   * Valida um JWT gerado pelo Next.js
   * 
   * @param token O token JWT a ser validado
   * @return Claims contendo as informações do usuário
   * @throws Exception se o token for inválido
   */
  public Claims validateToken(String token) throws Exception {
    SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

    return Jwts.parser()
        .verifyWith(key)
        .requireIssuer("tickets-frontend")
        .requireAudience("tickets-backend")
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  /**
   * Extrai o ID do usuário do token
   */
  public String getUserIdFromToken(String token) {
    try {
      Claims claims = validateToken(token);
      return claims.get("userId", String.class);
    } catch (Exception e) {
      throw new RuntimeException("Token inválido", e);
    }
  }

  /**
   * Extrai o email do usuário do token
   */
  public String getEmailFromToken(String token) {
    try {
      Claims claims = validateToken(token);
      return claims.get("email", String.class);
    } catch (Exception e) {
      throw new RuntimeException("Token inválido", e);
    }
  }

  /**
   * Extrai a role do usuário do token
   */
  public String getRoleFromToken(String token) {
    try {
      Claims claims = validateToken(token);
      return claims.get("role", String.class);
    } catch (Exception e) {
      throw new RuntimeException("Token inválido", e);
    }
  }
}
