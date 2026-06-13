package com.example.borrowabook.service;

import com.example.borrowabook.dto.BookCreateRequest;
import com.example.borrowabook.dto.BookRateRequest;
import com.example.borrowabook.dto.BookResponse;
import com.example.borrowabook.model.AppUser;
import com.example.borrowabook.model.UserRole;
import com.example.borrowabook.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BookRatingServiceTest {

    @Autowired
    private BookService bookService;

    @Autowired
    private BookRatingService bookRatingService;
    
    @Autowired
    private AppUserRepository appUserRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private AppUser testOwner;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString();
        testOwner = appUserRepository.save(AppUser.builder()
                .email("owner-" + suffix + "@example.com")
                .login("owner" + suffix)
                .passwordHash(passwordEncoder.encode("password"))
                .name("Test Owner")
                .surname("Owner")
                .userRole(UserRole.bookOwner)
                .build());
    }

    @Test
    void rateBookAndGetSummaryWorks() {
        String suffix = UUID.randomUUID().toString();
        BookResponse book = bookService.addBook(new BookCreateRequest(
                testOwner.getId(),
                "Rating Book " + suffix,
                "Rating Author " + suffix,
                "Education",
                "English",
                "Book used for rating tests"
        ));

        var first = bookRatingService.rateBook(book.id(), new BookRateRequest(5, "Great read", "Alice"));
        var second = bookRatingService.rateBook(book.id(), new BookRateRequest(4, "Good book", "Bob"));

        var summary = bookRatingService.getBookRating(book.id());

        assertThat(first.id()).isNotNull();
        assertThat(second.id()).isNotNull();
        assertThat(summary.ratingsCount()).isEqualTo(2);
        assertThat(summary.averageRating()).isEqualTo(4.5);
        assertThat(summary.ratings()).hasSize(2);
    }
}

