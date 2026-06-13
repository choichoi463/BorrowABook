package com.example.borrowabook.repository;

import com.example.borrowabook.model.BookRating;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRatingRepository extends JpaRepository<BookRating, Long> {
    List<BookRating> findByBook_IdOrderByCreatedAtDesc(Long bookId);
}

