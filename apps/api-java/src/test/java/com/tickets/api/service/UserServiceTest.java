package com.tickets.api.service;

import com.tickets.api.dto.user.CreateUserDto;
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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_shouldSaveUserAndReturnDto() {
        // Arrange
        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("test@example.com");
        dto.setName("Test User");
        dto.setRole(UserRole.PEDESTRIAN);

        User savedUser = User.builder()
                .id("u1")
                .email("test@example.com")
                .name("Test User")
                .role(UserRole.PEDESTRIAN)
                .build();

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        UserResponseDto result = userService.create(dto);

        // Assert
        assertNotNull(result);
        assertEquals("u1", result.getId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test User", result.getName());
        assertEquals(UserRole.PEDESTRIAN, result.getRole());
        verify(userRepository, times(1)).existsByEmail(dto.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void create_withExistingEmail_shouldThrowConflictException() {
        // Arrange
        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("existing@example.com");
        dto.setName("Test User");
        dto.setRole(UserRole.PEDESTRIAN);

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(ConflictException.class, () -> userService.create(dto));
        verify(userRepository, times(1)).existsByEmail(dto.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void findAll_shouldReturnAllUsers() {
        // Arrange
        User user1 = User.builder()
                .id("u1")
                .email("user1@example.com")
                .name("User 1")
                .role(UserRole.PEDESTRIAN)
                .build();

        User user2 = User.builder()
                .id("u2")
                .email("user2@example.com")
                .name("User 2")
                .role(UserRole.ADMIN)
                .build();

        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        // Act
        List<UserResponseDto> result = userService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("u1", result.get(0).getId());
        assertEquals("u2", result.get(1).getId());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void findById_shouldReturnUser() {
        // Arrange
        User user = User.builder()
                .id("u1")
                .email("test@example.com")
                .name("Test User")
                .role(UserRole.PEDESTRIAN)
                .build();

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        // Act
        UserResponseDto result = userService.findById("u1");

        // Assert
        assertNotNull(result);
        assertEquals("u1", result.getId());
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository, times(1)).findById("u1");
    }

    @Test
    void findById_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.findById("nonexistent"));
        verify(userRepository, times(1)).findById("nonexistent");
    }

    @Test
    void findByEmail_shouldReturnUser() {
        // Arrange
        User user = User.builder()
                .id("u1")
                .email("test@example.com")
                .name("Test User")
                .role(UserRole.PEDESTRIAN)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        // Act
        UserResponseDto result = userService.findByEmail("test@example.com");

        // Assert
        assertNotNull(result);
        assertEquals("u1", result.getId());
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void findByEmail_withNonExistentEmail_shouldThrowResourceNotFoundException() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.findByEmail("nonexistent@example.com"));
        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    void update_shouldUpdateUserAndReturnDto() {
        // Arrange
        User existingUser = User.builder()
                .id("u1")
                .email("old@example.com")
                .name("Old Name")
                .role(UserRole.PEDESTRIAN)
                .build();

        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("new@example.com");
        dto.setName("New Name");
        dto.setRole(UserRole.ADMIN);

        when(userRepository.findById("u1")).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponseDto result = userService.update("u1", dto);

        // Assert
        assertNotNull(result);
        assertEquals("u1", result.getId());
        assertEquals("new@example.com", result.getEmail());
        assertEquals("New Name", result.getName());
        assertEquals(UserRole.ADMIN, result.getRole());
        verify(userRepository, times(1)).findById("u1");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void update_withSameEmail_shouldNotCheckEmailConflict() {
        // Arrange
        User existingUser = User.builder()
                .id("u1")
                .email("test@example.com")
                .name("Old Name")
                .role(UserRole.PEDESTRIAN)
                .build();

        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("test@example.com"); // Same email
        dto.setName("New Name");
        dto.setRole(UserRole.ADMIN);

        when(userRepository.findById("u1")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponseDto result = userService.update("u1", dto);

        // Assert
        assertNotNull(result);
        assertEquals("New Name", result.getName());
        verify(userRepository, never()).existsByEmail(anyString());
    }

    @Test
    void update_withExistingEmail_shouldThrowConflictException() {
        // Arrange
        User existingUser = User.builder()
                .id("u1")
                .email("old@example.com")
                .name("Old Name")
                .role(UserRole.PEDESTRIAN)
                .build();

        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("existing@example.com");
        dto.setName("New Name");

        when(userRepository.findById("u1")).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        assertThrows(ConflictException.class, () -> userService.update("u1", dto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void update_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("new@example.com");
        dto.setName("New Name");

        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.update("nonexistent", dto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void delete_shouldDeleteUser() {
        // Arrange
        when(userRepository.existsById("u1")).thenReturn(true);

        // Act
        userService.delete("u1");

        // Assert
        verify(userRepository, times(1)).existsById("u1");
        verify(userRepository, times(1)).deleteById("u1");
    }

    @Test
    void delete_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        when(userRepository.existsById("nonexistent")).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.delete("nonexistent"));
        verify(userRepository, never()).deleteById(anyString());
    }

    @Test
    void syncOAuthUser_withNewUser_shouldCreateUser() {
        // Arrange
        when(userRepository.findByEmail("oauth@example.com")).thenReturn(Optional.empty());

        User savedUser = User.builder()
                .id("u1")
                .email("oauth@example.com")
                .name("OAuth User")
                .role(UserRole.PEDESTRIAN)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        UserResponseDto result = userService.syncOAuthUser(
                "oauth123",
                "oauth@example.com",
                "OAuth User",
                "image.jpg",
                "google",
                "provider123"
        );

        // Assert
        assertNotNull(result);
        assertEquals("u1", result.getId());
        assertEquals("oauth@example.com", result.getEmail());
        assertEquals("OAuth User", result.getName());
        assertEquals(UserRole.PEDESTRIAN, result.getRole());
        verify(userRepository, times(1)).findByEmail("oauth@example.com");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void syncOAuthUser_withExistingUser_shouldUpdateUser() {
        // Arrange
        User existingUser = User.builder()
                .id("u1")
                .email("oauth@example.com")
                .name("Old Name")
                .role(UserRole.PEDESTRIAN)
                .build();

        when(userRepository.findByEmail("oauth@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponseDto result = userService.syncOAuthUser(
                "oauth123",
                "oauth@example.com",
                "New Name",
                "image.jpg",
                "google",
                "provider123"
        );

        // Assert
        assertNotNull(result);
        assertEquals("u1", result.getId());
        assertEquals("oauth@example.com", result.getEmail());
        assertEquals("New Name", result.getName());
        verify(userRepository, times(1)).findByEmail("oauth@example.com");
        verify(userRepository, times(1)).save(any(User.class));
    }
}
