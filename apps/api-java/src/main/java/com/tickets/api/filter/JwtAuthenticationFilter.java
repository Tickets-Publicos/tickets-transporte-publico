package com.tickets.api.filter;

import com.tickets.api.config.JwtValidator;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que intercepta todas as requisições e valida o JWT do Next.js
 * Adiciona informações do usuário como atributos da request
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtValidator jwtValidator;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                    @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain filterChain) 
            throws ServletException, IOException {

        // Extrai o token do header Authorization
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // Valida o token JWT
                Claims claims = jwtValidator.validateToken(token);
                
                String userId = claims.get("userId", String.class);
                String email = claims.get("email", String.class);
                String name = claims.get("name", String.class);
                String role = claims.get("role", String.class);

                // Adiciona informações do usuário como atributos da request
                request.setAttribute("userId", userId);
                request.setAttribute("userEmail", email);
                request.setAttribute("userName", name);
                request.setAttribute("userRole", role);
                request.setAttribute("authenticated", true);

                logger.debug("Token JWT válido para usuário: " + email + " (role: " + role + ")");

            } catch (Exception e) {
                logger.warn("Erro ao validar token JWT: " + e.getMessage());
                // Token inválido, continua sem autenticação
                request.setAttribute("authenticated", false);
            }
        } else {
            request.setAttribute("authenticated", false);
        }

        filterChain.doFilter(request, response);
    }
}
