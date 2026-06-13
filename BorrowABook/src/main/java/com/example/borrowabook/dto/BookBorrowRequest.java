package com.example.borrowabook.dto;

import jakarta.validation.constraints.NotNull;

public record BookBorrowRequest(
        @NotNull Long borrowedByUserId
) {
}

