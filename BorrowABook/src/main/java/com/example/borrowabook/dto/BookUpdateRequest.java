package com.example.borrowabook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BookUpdateRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 255) String author,
        @Size(max = 255) String genre,
        @Size(max = 255) String language,
        @NotBlank @Size(max = 2000) String description
) {
}

