package com.example.borrowabook.controller;

import com.example.borrowabook.dto.BookRateRequest;
import com.example.borrowabook.dto.BookRatingResponse;
import com.example.borrowabook.dto.BookRatingSummaryResponse;
import com.example.borrowabook.service.BookRatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/books/{bookId}/ratings")
@RequiredArgsConstructor
public class BookRatingController {

    private final BookRatingService bookRatingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookRatingResponse rateBook(@PathVariable Long bookId, @Valid @RequestBody BookRateRequest request) {
        return bookRatingService.rateBook(bookId, request);
    }

    @GetMapping
    public BookRatingSummaryResponse getBookRating(@PathVariable Long bookId) {
        return bookRatingService.getBookRating(bookId);
    }
}

