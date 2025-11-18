package com.tickets.api.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Serviço para geração de tokens JWT
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private static final long JWT_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

    /**
     * Gera um token JWT para o usuário
     * @param userId ID do usuário
     * @param email Email do usuário
     * @param name Nome do usuário
     * @param role Role do usuário
     * @return Token JWT
     */
    public String generateToken(String userId, String email, String name, String role) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION_MS);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("name", name);
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .issuer("tickets-frontend")
                .audience().add("tickets-backend").and()
                .signWith(key)
                .compact();
    }
}
