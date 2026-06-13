package com.example.borrowabook.dto;

import jakarta.validation.constraints.NotBlank;

public record BookReturnRequest(
        @NotBlank String returnedBy
) {
}

