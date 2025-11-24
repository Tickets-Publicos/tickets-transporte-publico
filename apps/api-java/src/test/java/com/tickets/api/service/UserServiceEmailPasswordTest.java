package com.tickets.api.service;

import com.tickets.api.dto.user.UserResponseDto;
import com.tickets.api.exception.ConflictException;
import com.tickets.api.exception.ResourceNotFoundException;
import com.tickets.api.model.entity.User;
import com.tickets.api.model.enums.UserRole;
import com.tickets.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceEmailPasswordTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordService passwordService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterWithEmailPassword_Success() {
        String name = "John Doe";
        String email = "john@example.com";
        String password = "securePassword123";
        String salt = "randomSalt";
        String passwordHash = "hashedPassword";

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordService.generateSalt()).thenReturn(salt);
        when(passwordService.hashPassword(password, salt)).thenReturn(passwordHash);

        User savedUser = User.builder()
                .id("user-id")
                .email(email)
                .name(name)
                .role(UserRole.PEDESTRIAN)
                .passwordHash(passwordHash)
                .passwordSalt(salt)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponseDto result = userService.registerWithEmailPassword(name, email, password);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals(name, result.getName());
        assertEquals(UserRole.PEDESTRIAN, result.getRole());
        verify(userRepository).existsByEmail(email);
        verify(passwordService).generateSalt();
        verify(passwordService).hashPassword(password, salt);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterWithEmailPassword_EmailAlreadyExists() {
        String name = "John Doe";
        String email = "john@example.com";
        String password = "securePassword123";

        when(userRepository.existsByEmail(email)).thenReturn(true);

        assertThrows(ConflictException.class, () -> {
            userService.registerWithEmailPassword(name, email, password);
        });

        verify(userRepository).existsByEmail(email);
        verify(passwordService, never()).generateSalt();
        verify(passwordService, never()).hashPassword(anyString(), anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testAuthenticateWithEmailPassword_Success() {
        String email = "john@example.com";
        String password = "securePassword123";
        String salt = "randomSalt";
        String passwordHash = "hashedPassword";

        User user = User.builder()
                .id("user-id")
                .email(email)
                .name("John Doe")
                .role(UserRole.PEDESTRIAN)
                .passwordHash(passwordHash)
                .passwordSalt(salt)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordService.verifyPassword(password, salt, passwordHash)).thenReturn(true);

        UserResponseDto result = userService.authenticateWithEmailPassword(email, password);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(userRepository).findByEmail(email);
        verify(passwordService).verifyPassword(password, salt, passwordHash);
    }

    @Test
    void testAuthenticateWithEmailPassword_UserNotFound() {
        String email = "nonexistent@example.com";
        String password = "password123";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.authenticateWithEmailPassword(email, password);
        });

        verify(userRepository).findByEmail(email);
        verify(passwordService, never()).verifyPassword(anyString(), anyString(), anyString());
    }

    @Test
    void testAuthenticateWithEmailPassword_WrongPassword() {
        String email = "john@example.com";
        String password = "wrongPassword";
        String salt = "randomSalt";
        String passwordHash = "hashedPassword";

        User user = User.builder()
                .id("user-id")
                .email(email)
                .name("John Doe")
                .role(UserRole.PEDESTRIAN)
                .passwordHash(passwordHash)
                .passwordSalt(salt)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordService.verifyPassword(password, salt, passwordHash)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.authenticateWithEmailPassword(email, password);
        });

        verify(userRepository).findByEmail(email);
        verify(passwordService).verifyPassword(password, salt, passwordHash);
    }

    @Test
    void testAuthenticateWithEmailPassword_OAuthUserWithoutPassword() {
        String email = "oauth@example.com";
        String password = "anyPassword";

        User user = User.builder()
                .id("user-id")
                .email(email)
                .name("OAuth User")
                .role(UserRole.PEDESTRIAN)
                .passwordHash(null)  // OAuth user doesn't have password
                .passwordSalt(null)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.authenticateWithEmailPassword(email, password);
        });

        verify(userRepository).findByEmail(email);
        verify(passwordService, never()).verifyPassword(anyString(), anyString(), anyString());
    }
}
