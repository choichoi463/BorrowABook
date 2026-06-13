package com.example.borrowabook.service;

import com.example.borrowabook.dto.BookRateRequest;
import com.example.borrowabook.dto.BookRatingResponse;
import com.example.borrowabook.dto.BookRatingSummaryResponse;
import com.example.borrowabook.model.Book;
import com.example.borrowabook.model.BookRating;
import com.example.borrowabook.repository.BookRatingRepository;
import com.example.borrowabook.repository.BookRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BookRatingService {

    private final BookRepository bookRepository;
    private final BookRatingRepository bookRatingRepository;

    @Transactional
    public BookRatingResponse rateBook(Long bookId, BookRateRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

        BookRating savedRating = bookRatingRepository.save(BookRating.builder()
                .book(book)
                .rating(request.rating())
                .comment(request.comment().trim())
                .ratedBy(StringUtils.hasText(request.ratedBy()) ? request.ratedBy().trim() : null)
                .createdAt(LocalDateTime.now())
                .build());

        return toResponse(savedRating);
    }

    @Transactional(readOnly = true)
    public BookRatingSummaryResponse getBookRating(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found");
        }

        List<BookRatingResponse> ratings = bookRatingRepository.findByBook_IdOrderByCreatedAtDesc(bookId)
                .stream()
                .map(this::toResponse)
                .toList();

        double averageRating = ratings.stream().mapToInt(BookRatingResponse::rating).average().orElse(0.0);

        return new BookRatingSummaryResponse(
                bookId,
                averageRating,
                ratings.size(),
                ratings
        );
    }

    private BookRatingResponse toResponse(BookRating rating) {
        return new BookRatingResponse(
                rating.getId(),
                rating.getRating(),
                rating.getComment(),
                rating.getRatedBy(),
                rating.getCreatedAt()
        );
    }
}

