package com.example.borrowabook.controller;

import com.example.borrowabook.dto.BookBorrowRequest;
import com.example.borrowabook.dto.BookCreateRequest;
import com.example.borrowabook.dto.BookDeactivateRequest;
import com.example.borrowabook.dto.BookActivateRequest;
import com.example.borrowabook.dto.BookHistoryResponse;
import com.example.borrowabook.dto.BookResponse;
import com.example.borrowabook.dto.BookReturnRequest;
import com.example.borrowabook.dto.BookUpdateRequest;
import com.example.borrowabook.model.UserRole;
import com.example.borrowabook.service.BookService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse addBook(@Valid @RequestBody BookCreateRequest request) {
        return bookService.addBook(request);
    }

    @GetMapping
    public List<BookResponse> getBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) String borrowedBy,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) UserRole userRole,
            @RequestParam(required = false, defaultValue = "false") Boolean includeInactive
    ) {
        return bookService.getBooks(title, author, owner, borrowedBy, available, userRole, includeInactive);
    }

    @DeleteMapping("/{bookId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBook(
            @PathVariable Long bookId,
            @RequestParam(required = false) String deletedBy
    ) {
        bookService.deleteBook(bookId, deletedBy);
    }

    @PutMapping("/{bookId}")
    public BookResponse updateBook(@PathVariable Long bookId, @Valid @RequestBody BookUpdateRequest request) {
        return bookService.updateBook(bookId, request);
    }

    @PostMapping("/{bookId}/borrow")
    public BookResponse borrowBook(@PathVariable Long bookId, @Valid @RequestBody BookBorrowRequest request) {
        return bookService.borrowBook(bookId, request);
    }

    @PostMapping("/{bookId}/return")
    public BookResponse returnBook(@PathVariable Long bookId, @Valid @RequestBody BookReturnRequest request) {
        return bookService.returnBook(bookId, request);
    }

    @GetMapping("/{bookId}/history")
    public List<BookHistoryResponse> getBookHistory(@PathVariable Long bookId) {
        return bookService.getBookHistory(bookId);
    }

    @PostMapping("/{bookId}/deactivate")
    public BookResponse deactivateBook(@PathVariable Long bookId, @Valid @RequestBody BookDeactivateRequest request) {
        return bookService.deactivateBook(bookId, request.userId(), request.userRole(), request.deactivatedBy());
    }

    @PostMapping("/{bookId}/activate")
    public BookResponse activateBook(@PathVariable Long bookId, @Valid @RequestBody BookActivateRequest request) {
        return bookService.activateBook(bookId, request.userId(), request.userRole(), request.activatedBy());
    }
}

