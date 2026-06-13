package com.example.borrowabook.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @NotBlank @Email String email,
        String contact,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String surname
) {
}

