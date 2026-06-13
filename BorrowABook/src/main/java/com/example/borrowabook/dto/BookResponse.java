package com.example.borrowabook.dto;

import java.time.LocalDate;

public record BookResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String ownerSurname,
        String ownerContact,
        String title,
        String author,
        String genre,
        String language,
        String description,
        LocalDate dateAdded,
        LocalDate dateBorrowed,
        LocalDate dateReturned,
        Long borrowedByUserId,
        String borrowedByUserName,
        String borrowedByUserSurname,
        String borrowedByUserContact,
        Long lastReaderUserId,
        String lastReaderUserName,
        String lastReaderUserSurname,
        Boolean isInactive
) {
}

