package com.example.borrowabook.controller;

import com.example.borrowabook.dto.LoginUserResponse;
import com.example.borrowabook.model.UserRole;
import com.example.borrowabook.service.UserLoginService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserLoginControllerTest {

    private MockMvc mockMvc;

    private UserLoginService userLoginService;

    @BeforeEach
    void setUp() {
        userLoginService = org.mockito.Mockito.mock(UserLoginService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new UserLoginController(userLoginService)).build();
    }

    @Test
    void loginEndpointReturnsUserDataForValidCredentials() throws Exception {
        when(userLoginService.login(any())).thenReturn(
                new LoginUserResponse(1L, "controller-login@example.com", "+1-202-555-0123", "controller-user", "Alice", "Tester", UserRole.admin)
        );

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "login": "controller-user",
                                  "password": "ControllerPassword123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("controller-login@example.com"))
                .andExpect(jsonPath("$.login").value("controller-user"))
                .andExpect(jsonPath("$.userRole").value("admin"));
    }

    @Test
    void loginEndpointReturnsUnauthorizedForInvalidPassword() throws Exception {
        doThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid credentials"))
                .when(userLoginService)
                .login(any());

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "login": "controller-user-fail",
                                  "password": "wrong-password"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forgotPasswordEndpointReturnsNoContent() throws Exception {
        mockMvc.perform(post("/api/users/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "user@example.com"
                                }
                                """))
                .andExpect(status().isNoContent());

        verify(userLoginService).forgotPassword(any());
    }

    @Test
    void updateProfileEndpointReturnsUpdatedUserData() throws Exception {
        when(userLoginService.updateProfile(anyLong(), any())).thenReturn(
                new LoginUserResponse(1L, "updated@example.com", "+1-202-555-0130", "controller-user", "Alice", "Updated", UserRole.admin)
        );

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "updated@example.com",
                                  "contact": "+1-202-555-0130",
                                  "name": "Alice",
                                  "surname": "Updated"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@example.com"))
                .andExpect(jsonPath("$.contact").value("+1-202-555-0130"))
                .andExpect(jsonPath("$.login").value("controller-user"));
    }
}
