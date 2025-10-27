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

    System.out.println("[AuthController] sync-user called");
    System.out.println("[AuthController] Request: " + request);
    System.out.println("[AuthController] Expected secret: " + jwtSecret);
    System.out.println("[AuthController] Received secret: " + authSecret);

    // Valida que a requisição veio do Next.js
    if (!jwtSecret.equals(authSecret)) {
      System.out.println("[AuthController] ERROR - Secret mismatch - Forbidden");
      return ResponseEntity.status(403).body("Forbidden");
    }

    try {
      System.out.println("[AuthController] Calling userService.syncOAuthUser...");
      var user = userService.syncOAuthUser(
          request.getId(),
          request.getEmail(),
          request.getName(),
          request.getImage(),
          request.getProvider(),
          request.getProviderId());

      System.out.println("[AuthController] SUCCESS - User synced successfully: " + user);
      return ResponseEntity.ok(user);
    } catch (Exception e) {
      System.err.println("[AuthController] ERROR - Error syncing user: " + e.getMessage());
      e.printStackTrace();
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
