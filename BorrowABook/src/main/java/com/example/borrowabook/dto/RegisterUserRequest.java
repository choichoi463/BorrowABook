package com.example.borrowabook.dto;

import com.example.borrowabook.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(
        @NotBlank @Email String email,
        String contact,
        @NotBlank @Size(min = 3, max = 50) String login,
        @NotBlank @Size(min = 8, max = 128) String password,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String surname,
        @NotNull UserRole userRole
) {
}

