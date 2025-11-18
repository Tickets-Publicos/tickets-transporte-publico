package com.tickets.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickets.api.dto.user.CreateUserDto;
import com.tickets.api.dto.user.UserResponseDto;
import com.tickets.api.model.enums.UserRole;
import com.tickets.api.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper mapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    @Test
    void create_shouldReturn201() throws Exception {
        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("test@example.com");
        dto.setName("Test User");
        dto.setRole(UserRole.PEDESTRIAN);

        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId("u1");
        responseDto.setEmail("test@example.com");
        responseDto.setName("Test User");

        when(userService.create(any(CreateUserDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("u1"))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(userService, times(1)).create(any(CreateUserDto.class));
    }

    @Test
    void findAll_shouldReturn200() throws Exception {
        UserResponseDto user1 = new UserResponseDto();
        user1.setId("u1");
        user1.setEmail("user1@example.com");

        UserResponseDto user2 = new UserResponseDto();
        user2.setId("u2");
        user2.setEmail("user2@example.com");

        when(userService.findAll()).thenReturn(Arrays.asList(user1, user2));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("u1"))
                .andExpect(jsonPath("$[1].id").value("u2"));

        verify(userService, times(1)).findAll();
    }

    @Test
    void findById_shouldReturn200() throws Exception {
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId("u1");
        responseDto.setEmail("test@example.com");

        when(userService.findById("u1")).thenReturn(responseDto);

        mockMvc.perform(get("/users/u1")
                .requestAttr("userId", "u1")
                .requestAttr("userRole", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("u1"));

        verify(userService, times(1)).findById("u1");
    }

    @Test
    void findById_withoutAdminRole_shouldReturn403() throws Exception {
        mockMvc.perform(get("/users/u1")
                .requestAttr("userId", "u2")
                .requestAttr("userRole", "PEDESTRIAN"))
                .andExpect(status().isForbidden());

        verify(userService, never()).findById(any());
    }

    @Test
    void findByEmail_shouldReturn200() throws Exception {
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId("u1");
        responseDto.setEmail("test@example.com");

        when(userService.findByEmail("test@example.com")).thenReturn(responseDto);

        mockMvc.perform(get("/users/email/test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(userService, times(1)).findByEmail("test@example.com");
    }

    @Test
    void update_shouldReturn200() throws Exception {
        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("updated@example.com");
        dto.setName("Updated User");

        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId("u1");
        responseDto.setEmail("updated@example.com");

        when(userService.update(eq("u1"), any(CreateUserDto.class))).thenReturn(responseDto);

        mockMvc.perform(patch("/users/u1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto))
                .requestAttr("userId", "u1")
                .requestAttr("userRole", "PEDESTRIAN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@example.com"));

        verify(userService, times(1)).update(eq("u1"), any(CreateUserDto.class));
    }

    @Test
    void update_withoutPermission_shouldReturn403() throws Exception {
        CreateUserDto dto = new CreateUserDto();
        dto.setEmail("updated@example.com");
        dto.setName("Updated Name");

        mockMvc.perform(patch("/users/u1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto))
                .requestAttr("userId", "u2")
                .requestAttr("userRole", "PEDESTRIAN"))
                .andExpect(status().isForbidden());

        verify(userService, never()).update(any(), any());
    }
}
