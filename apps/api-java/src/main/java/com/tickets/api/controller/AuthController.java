package com.tickets.api.controller;

import com.tickets.api.dto.UserSyncRequest;
import com.tickets.api.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller para sincronização de usuários OAuth do Next.js com o backend
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

  @Autowired
  private UserService userService;

  @Value("${jwt.secret}")
  private String jwtSecret;

  /**
   * Endpoint chamado pelo Next.js quando um usuário faz login via OAuth
   * Cria ou atualiza o usuário no banco de dados
   */
  @PostMapping("/sync-user")
  public ResponseEntity<?> syncUser(
      @RequestHeader("X-Auth-Secret") String authSecret,
      @RequestBody UserSyncRequest request) {

    // Valida que a requisição veio do Next.js
    if (!jwtSecret.equals(authSecret)) {
      return ResponseEntity.status(403).body("Forbidden");
    }

    try {
      var user = userService.syncOAuthUser(
          request.getId(),
          request.getEmail(),
          request.getName(),
          request.getImage(),
          request.getProvider(),
          request.getProviderId());

      return ResponseEntity.ok(user);
    } catch (Exception e) {
      return ResponseEntity.status(500)
          .body("Error syncing user: " + e.getMessage());
    }
  }

  /**
   * Endpoint de teste para verificar se o JWT está sendo validado corretamente
   */
  @GetMapping("/me")
  public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
    String userId = (String) request.getAttribute("userId");
    String email = (String) request.getAttribute("userEmail");

    if (userId == null || email == null) {
      return ResponseEntity.status(401).body("Não autenticado");
    }

    return ResponseEntity.ok(Map.of(
        "userId", userId,
        "email", email));
  }
}
