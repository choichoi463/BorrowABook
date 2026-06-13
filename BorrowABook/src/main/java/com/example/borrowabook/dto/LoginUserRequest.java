package com.example.borrowabook.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginUserRequest(
        @NotBlank String login,
        @NotBlank String password
) {
}

