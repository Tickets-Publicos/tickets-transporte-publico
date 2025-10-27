package com.tickets.api.service;

import com.tickets.api.dto.user.CreateUserDto;
import com.tickets.api.dto.user.UserResponseDto;
import com.tickets.api.exception.ConflictException;
import com.tickets.api.exception.ResourceNotFoundException;
import com.tickets.api.model.entity.User;
import com.tickets.api.model.enums.UserRole;
import com.tickets.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;

  @Transactional
  public UserResponseDto create(CreateUserDto dto) {
    // Verificar se email já existe
    if (userRepository.existsByEmail(dto.getEmail())) {
      throw new ConflictException("Email já cadastrado");
    }

    User user = User.builder()
        .email(dto.getEmail())
        .name(dto.getName())
        .role(dto.getRole())
        .build();

    User savedUser = userRepository.save(user);
    return mapToDto(savedUser);
  }

  @Transactional(readOnly = true)
  public List<UserResponseDto> findAll() {
    return userRepository.findAll().stream()
        .map(this::mapToDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public UserResponseDto findById(String id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário com ID " + id + " não encontrado"));
    return mapToDto(user);
  }

  @Transactional(readOnly = true)
  public UserResponseDto findByEmail(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário com email " + email + " não encontrado"));
    return mapToDto(user);
  }

  @Transactional
  public UserResponseDto update(String id, CreateUserDto dto) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário com ID " + id + " não encontrado"));

    // Verificar se novo email já está em uso
    if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
      if (userRepository.existsByEmail(dto.getEmail())) {
        throw new ConflictException("Email já cadastrado");
      }
      user.setEmail(dto.getEmail());
    }

    if (dto.getName() != null) {
      user.setName(dto.getName());
    }

    if (dto.getRole() != null) {
      user.setRole(dto.getRole());
    }

    User updatedUser = userRepository.save(user);
    return mapToDto(updatedUser);
  }

  @Transactional
  public void delete(String id) {
    if (!userRepository.existsById(id)) {
      throw new ResourceNotFoundException("Usuário com ID " + id + " não encontrado");
    }
    userRepository.deleteById(id);
  }

  /**
   * Sincroniza um usuário OAuth do Next.js com o banco de dados
   * Cria o usuário se não existir, ou atualiza as informações se já existir
   */
  @Transactional
  public UserResponseDto syncOAuthUser(
      String oauthId,
      String email,
      String name,
      String image,
      String provider,
      String providerId) {
    System.out.println("[UserService] syncOAuthUser called");
    System.out.println("[UserService] Email: " + email);
    System.out.println("[UserService] Name: " + name);
    System.out.println("[UserService] Provider: " + provider);
    
    // Busca usuário por email
    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null) {
      System.out.println("[UserService] User not found, creating new user");
      // Cria novo usuário
      user = User.builder()
          .email(email)
          .name(name)
          .role(UserRole.PEDESTRIAN) // Role padrão para usuários OAuth
          .build();
    } else {
      System.out.println("[UserService] User found, updating information");
      // Atualiza informações do usuário existente
      user.setName(name);
    }

    System.out.println("[UserService] Saving user to database...");
    User savedUser = userRepository.save(user);
    System.out.println("[UserService] SUCCESS - User saved successfully: " + savedUser.getId());
    return mapToDto(savedUser);
  }

  private UserResponseDto mapToDto(User user) {
    UserResponseDto dto = new UserResponseDto();
    dto.setId(user.getId());
    dto.setEmail(user.getEmail());
    dto.setName(user.getName());
    dto.setRole(user.getRole());
    dto.setCreatedAt(user.getCreatedAt());
    dto.setUpdatedAt(user.getUpdatedAt());
    return dto;
  }
}
