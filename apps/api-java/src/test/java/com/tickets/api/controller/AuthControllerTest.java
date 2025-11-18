package com.tickets.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickets.api.dto.UserSyncRequest;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper mapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    private final String JWT_SECRET = "test-secret-key";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authController, "jwtSecret", JWT_SECRET);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void syncUser_withValidSecret_shouldReturn200() throws Exception {
        UserSyncRequest request = new UserSyncRequest();
        request.setId("oauth123");
        request.setEmail("oauth@example.com");
        request.setName("OAuth User");
        request.setImage("image.jpg");
        request.setProvider("google");
        request.setProviderId("provider123");

        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId("u1");
        responseDto.setEmail("oauth@example.com");
        responseDto.setName("OAuth User");
        responseDto.setRole(UserRole.PEDESTRIAN);

        when(userService.syncOAuthUser(
                eq("oauth123"), eq("oauth@example.com"), eq("OAuth User"), 
                eq("image.jpg"), eq("google"), eq("provider123")))
                .thenReturn(responseDto);

        mockMvc.perform(post("/auth/sync-user")
                .header("X-Auth-Secret", JWT_SECRET)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("u1"))
                .andExpect(jsonPath("$.email").value("oauth@example.com"));

        verify(userService, times(1)).syncOAuthUser(
                eq("oauth123"), eq("oauth@example.com"), eq("OAuth User"), 
                eq("image.jpg"), eq("google"), eq("provider123"));
    }

    @Test
    void syncUser_withInvalidSecret_shouldReturn403() throws Exception {
        UserSyncRequest request = new UserSyncRequest();
        request.setId("oauth123");
        request.setEmail("oauth@example.com");
        request.setName("OAuth User");

        mockMvc.perform(post("/auth/sync-user")
                .header("X-Auth-Secret", "wrong-secret")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        verify(userService, never()).syncOAuthUser(
                anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void syncUser_withMissingSecret_shouldReturn400() throws Exception {
        UserSyncRequest request = new UserSyncRequest();
        request.setId("oauth123");
        request.setEmail("oauth@example.com");
        request.setName("OAuth User");

        // Missing header causes 400 Bad Request
        mockMvc.perform(post("/auth/sync-user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).syncOAuthUser(
                anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void syncUser_withServiceException_shouldReturn500() throws Exception {
        UserSyncRequest request = new UserSyncRequest();
        request.setId("oauth123");
        request.setEmail("oauth@example.com");
        request.setName("OAuth User");
        request.setImage("image.jpg");
        request.setProvider("google");
        request.setProviderId("provider123");

        when(userService.syncOAuthUser(
                eq("oauth123"), eq("oauth@example.com"), eq("OAuth User"), 
                eq("image.jpg"), eq("google"), eq("provider123")))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/auth/sync-user")
                .header("X-Auth-Secret", JWT_SECRET)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());

        verify(userService, times(1)).syncOAuthUser(
                eq("oauth123"), eq("oauth@example.com"), eq("OAuth User"), 
                eq("image.jpg"), eq("google"), eq("provider123"));
    }

    @Test
    void getCurrentUser_withValidAttributes_shouldReturn200() throws Exception {
        mockMvc.perform(get("/auth/me")
                .requestAttr("userId", "u1")
                .requestAttr("userEmail", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("u1"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getCurrentUser_withoutUserId_shouldReturn401() throws Exception {
        mockMvc.perform(get("/auth/me")
                .requestAttr("userEmail", "test@example.com"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_withoutUserEmail_shouldReturn401() throws Exception {
        mockMvc.perform(get("/auth/me")
                .requestAttr("userId", "u1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_withoutAttributes_shouldReturn401() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
