package com.example.borrowabook.service;

import com.example.borrowabook.dto.BookBorrowRequest;
import com.example.borrowabook.dto.BookCreateRequest;
import com.example.borrowabook.dto.BookResponse;
import com.example.borrowabook.dto.BookReturnRequest;
import com.example.borrowabook.model.AppUser;
import com.example.borrowabook.model.BookHistoryAction;
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
class BookServiceTest {

    @Autowired
    private BookService bookService;
    
    @Autowired
    private AppUserRepository appUserRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private AppUser testOwner;
    private AppUser testBorrower;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString();
        
        testOwner = appUserRepository.save(AppUser.builder()
                .email("owner-" + suffix + "@example.com")
                .login("owner" + suffix)
                .passwordHash(passwordEncoder.encode("password"))
                .name("Test Owner " + suffix)
                .surname("Owner")
                .contact("+1-202-555-0100")
                .userRole(UserRole.bookOwner)
                .build());
        
        testBorrower = appUserRepository.save(AppUser.builder()
                .email("borrow-" + suffix + "@example.com")
                .login("borrower" + suffix)
                .passwordHash(passwordEncoder.encode("password"))
                .name("Test Borrower " + suffix)
                .surname("Borrower")
                .contact("+1-202-555-0200")
                .userRole(UserRole.bookOwner)
                .build());
    }

    @Test
    void addBorrowReturnAndHistoryWorks() {
        String suffix = UUID.randomUUID().toString();
        BookResponse created = bookService.addBook(new BookCreateRequest(
                testOwner.getId(),
                "Book " + suffix,
                "Author " + suffix,
                "Fiction",
                "English",
                "Interesting description"
        ));

        AppUser reader2 = appUserRepository.save(AppUser.builder()
                .email("reader2-" + suffix + "@example.com")
                .login("reader2" + suffix)
                .passwordHash(passwordEncoder.encode("password"))
                .name("Reader 2")
                .surname("Reader")
                .userRole(UserRole.bookOwner)
                .build());
        
        BookResponse borrowed = bookService.borrowBook(created.id(), new BookBorrowRequest(testBorrower.getId()));
        BookResponse returned = bookService.returnBook(created.id(), new BookReturnRequest("Test Borrower"));

        assertThat(created.id()).isNotNull();
        assertThat(created.author()).isEqualTo("Author " + suffix);
        assertThat(borrowed.borrowedByUserName()).isEqualTo(testBorrower.getName());
        assertThat(returned.borrowedByUserId()).isNull();
        assertThat(returned.dateBorrowed()).isNull();
        assertThat(returned.dateReturned()).isNotNull();
        assertThat(returned.lastReaderUserName()).isNotNull();

        var history = bookService.getBookHistory(created.id());
        assertThat(history).hasSizeGreaterThanOrEqualTo(3);
        assertThat(history).extracting("action")
                .contains(BookHistoryAction.CREATED, BookHistoryAction.BORROWED, BookHistoryAction.RETURNED);
    }

    @Test
    void filterByAvailabilityReturnsOnlyNotBorrowedBooks() {
        String suffix = UUID.randomUUID().toString();

        BookResponse available = bookService.addBook(new BookCreateRequest(
                testOwner.getId(),
                "Available Book " + suffix,
                "Available Author " + suffix,
                "Technology",
                "English",
                "Available book description"
        ));

        BookResponse borrowed = bookService.addBook(new BookCreateRequest(
                testOwner.getId(),
                "Borrowed Book " + suffix,
                "Borrowed Author " + suffix,
                "History",
                "German",
                "Borrowed book description"
        ));
        bookService.borrowBook(borrowed.id(), new BookBorrowRequest(testBorrower.getId()));

        var availableBooks = bookService.getBooks(null, null, null, null, true, null);

        assertThat(availableBooks).extracting(BookResponse::id).contains(available.id());
        assertThat(availableBooks).extracting(BookResponse::id).doesNotContain(borrowed.id());
    }

    @Test
    void borrowAllowsReplacingCurrentBorrower() {
        String suffix = UUID.randomUUID().toString();
        
        AppUser readerA = appUserRepository.save(AppUser.builder()
                .email("readerA-" + suffix + "@example.com")
                .login("readerA" + suffix)
                .passwordHash(passwordEncoder.encode("password"))
                .name("Reader A")
                .surname("A")
                .userRole(UserRole.bookOwner)
                .build());
        
        AppUser readerB = appUserRepository.save(AppUser.builder()
                .email("readerB-" + suffix + "@example.com")
                .login("readerB" + suffix)
                .passwordHash(passwordEncoder.encode("password"))
                .name("Reader B")
                .surname("B")
                .userRole(UserRole.bookOwner)
                .build());
        
        BookResponse created = bookService.addBook(new BookCreateRequest(
                testOwner.getId(),
                "Book " + suffix,
                "Author " + suffix,
                "Fantasy",
                "Spanish",
                "Book for reborrow scenario"
        ));

        BookResponse firstBorrow = bookService.borrowBook(created.id(), new BookBorrowRequest(readerA.getId()));
        BookResponse secondBorrow = bookService.borrowBook(created.id(), new BookBorrowRequest(readerB.getId()));

        assertThat(firstBorrow.borrowedByUserName()).isEqualTo("Reader A");
        assertThat(secondBorrow.borrowedByUserName()).isEqualTo("Reader B");
        assertThat(secondBorrow.lastReaderUserName()).isEqualTo("Reader A");
        assertThat(secondBorrow.dateBorrowed()).isNotNull();
    }
}
