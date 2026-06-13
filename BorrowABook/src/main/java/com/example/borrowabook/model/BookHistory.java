package com.example.borrowabook.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "book_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String owner;

    @Column
    private String previousBorrowedBy;

    @Column
    private String previousBorrowedBySurname;

    @Column
    private LocalDate previousDateBorrowed;

    @Column
    private LocalDate previousDateReturned;

    @Column
    private String previousLastReader;

    @Column
    private String changedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookHistoryAction action;

    @Column(nullable = false)
    private LocalDateTime changedAt;
}

