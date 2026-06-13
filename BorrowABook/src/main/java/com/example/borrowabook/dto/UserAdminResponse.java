package com.example.borrowabook.dto;

import com.example.borrowabook.model.UserRole;

public record UserAdminResponse(
        Long id,
        String email,
        String contact,
        String login,
        String name,
        String surname,
        UserRole userRole,
        Boolean isActive
) {
}

