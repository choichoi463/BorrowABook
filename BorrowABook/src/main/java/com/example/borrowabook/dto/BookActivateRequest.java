package com.example.borrowabook.dto;

import jakarta.validation.constraints.NotNull;

public record BookActivateRequest(
        @NotNull(message = "Activated by username is required")
        String activatedBy,
        @NotNull(message = "User ID is required")
        Long userId,
        @NotNull(message = "User role is required")
        String userRole
) {
}


