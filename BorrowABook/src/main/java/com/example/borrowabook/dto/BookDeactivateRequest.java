package com.example.borrowabook.dto;

import jakarta.validation.constraints.NotNull;

public record BookDeactivateRequest(
        @NotNull(message = "Deactivated by username is required")
        String deactivatedBy,
        @NotNull(message = "User ID is required")
        Long userId,
        @NotNull(message = "User role is required")
        String userRole
) {
}

