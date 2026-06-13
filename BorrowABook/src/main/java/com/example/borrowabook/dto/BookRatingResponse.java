package com.example.borrowabook.dto;

import java.time.LocalDateTime;

public record BookRatingResponse(
        Long id,
        int rating,
        String comment,
        String ratedBy,
        LocalDateTime createdAt
) {
}

