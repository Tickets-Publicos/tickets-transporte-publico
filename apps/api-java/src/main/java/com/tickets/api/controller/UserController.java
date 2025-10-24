package com.tickets.api.controller;

import com.tickets.api.annotation.RequireRole;
import com.tickets.api.dto.user.CreateUserDto;
import com.tickets.api.dto.user.UserResponseDto;
import com.tickets.api.model.enums.UserRole;
import com.tickets.api.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  /**
   * Cria um novo usuário.
   * Geralmente usado apenas internamente ou por admins.
   */
  @RequireRole({ UserRole.ADMIN })
  @PostMapping
  public ResponseEntity<UserResponseDto> create(@Valid @RequestBody CreateUserDto dto) {
    UserResponseDto user = userService.create(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(user);
  }

  /**
   * Lista todos os usuários.
   * Apenas administradores podem listar todos os usuários.
   */
  @RequireRole({ UserRole.ADMIN })
  @GetMapping
  public ResponseEntity<List<UserResponseDto>> findAll() {
    List<UserResponseDto> users = userService.findAll();
    return ResponseEntity.ok(users);
  }

  /**
   * Busca usuário por ID.
   * Usuários podem ver apenas seu próprio perfil, admins podem ver todos.
   */
  @GetMapping("/{id}")
  public ResponseEntity<UserResponseDto> findById(
      @PathVariable String id,
      HttpServletRequest request) {
    String requestUserId = (String) request.getAttribute("userId");
    String userRole = (String) request.getAttribute("userRole");

    // Verifica se é admin ou o próprio usuário
    if (!"ADMIN".equals(userRole) && !id.equals(requestUserId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    UserResponseDto user = userService.findById(id);
    return ResponseEntity.ok(user);
  }

  /**
   * Busca usuário por email.
   * Usado pelo frontend para obter informações do usuário logado.
   * Qualquer usuário autenticado pode buscar por email.
   */
  @GetMapping("/email/{email}")
  public ResponseEntity<UserResponseDto> findByEmail(@PathVariable String email) {
    UserResponseDto user = userService.findByEmail(email);
    return ResponseEntity.ok(user);
  }

  /**
   * Atualiza dados do usuário.
   * Usuários podem atualizar apenas seu próprio perfil, admins podem atualizar
   * todos.
   */
  @PatchMapping("/{id}")
  public ResponseEntity<UserResponseDto> update(
      @PathVariable String id,
      @Valid @RequestBody CreateUserDto dto,
      HttpServletRequest request) {
    String requestUserId = (String) request.getAttribute("userId");
    String userRole = (String) request.getAttribute("userRole");

    // Verifica se é admin ou o próprio usuário
    if (!"ADMIN".equals(userRole) && !id.equals(requestUserId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    UserResponseDto user = userService.update(id, dto);
    return ResponseEntity.ok(user);
  }

  /**
   * Deleta um usuário.
   * Apenas administradores podem deletar usuários.
   */
  @RequireRole({ UserRole.ADMIN })
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    userService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
