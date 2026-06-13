package com.example.borrowabook.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "books")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrowed_by_id", nullable = true)
    private AppUser borrowedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_reader_id", nullable = true)
    private AppUser lastReaderUser;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column
    private String genre;

    @Column
    private String language;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDate dateAdded;

    @Column
    private LocalDate dateBorrowed;

    @Column
    private LocalDate dateReturned;

    @Column(nullable = false)
    private Boolean isInactive;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole userRole;
}

