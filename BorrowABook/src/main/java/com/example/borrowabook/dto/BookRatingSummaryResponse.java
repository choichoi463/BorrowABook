package com.example.borrowabook.dto;

import java.util.List;

public record BookRatingSummaryResponse(
        Long bookId,
        double averageRating,
        int ratingsCount,
        List<BookRatingResponse> ratings
) {
}

