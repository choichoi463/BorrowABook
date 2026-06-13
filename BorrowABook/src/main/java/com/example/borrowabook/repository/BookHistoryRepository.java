package com.example.borrowabook.repository;

import com.example.borrowabook.model.BookHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookHistoryRepository extends JpaRepository<BookHistory, Long> {
    List<BookHistory> findByBookIdOrderByChangedAtDesc(Long bookId);
}

