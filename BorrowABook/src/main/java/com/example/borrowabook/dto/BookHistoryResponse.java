package com.example.borrowabook.dto;

import com.example.borrowabook.model.BookHistoryAction;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookHistoryResponse(
        Long id,
        Long bookId,
        String title,
        String owner,
        String previousBorrowedBy,
        String previousBorrowedBySurname,
        LocalDate previousDateBorrowed,
        LocalDate previousDateReturned,
        String previousLastReader,
        String changedBy,
        BookHistoryAction action,
        LocalDateTime changedAt
) {
}

