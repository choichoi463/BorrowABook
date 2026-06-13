package com.example.borrowabook.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record BookRateRequest(
        @Min(1) @Max(5) int rating,
        @NotBlank String comment,
        String ratedBy
) {
}

