package com.example.borrowabook.service;

import com.example.borrowabook.dto.BookBorrowRequest;
import com.example.borrowabook.dto.BookCreateRequest;
import com.example.borrowabook.dto.BookHistoryResponse;
import com.example.borrowabook.dto.BookResponse;
import com.example.borrowabook.dto.BookReturnRequest;
import com.example.borrowabook.dto.BookUpdateRequest;
import com.example.borrowabook.model.AppUser;
import com.example.borrowabook.model.Book;
import com.example.borrowabook.model.BookHistory;
import com.example.borrowabook.model.BookHistoryAction;
import com.example.borrowabook.model.UserRole;
import com.example.borrowabook.repository.AppUserRepository;
import com.example.borrowabook.repository.BookHistoryRepository;
import com.example.borrowabook.repository.BookRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookHistoryRepository bookHistoryRepository;
    private final AppUserRepository appUserRepository;

    @Transactional
    public BookResponse addBook(BookCreateRequest request) {
        AppUser owner = appUserRepository.findById(request.ownerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner user not found"));
        
        Book savedBook = bookRepository.save(Book.builder()
                .owner(owner)
                .title(request.title().trim())
                .author(request.author().trim())
                .genre(trimToNull(request.genre()))
                .language(trimToNull(request.language()))
                .description(request.description().trim())
                .dateAdded(LocalDate.now())
                .isInactive(false)
                .userRole(owner.getUserRole())
                .build());

        saveHistory(savedBook, BookHistoryAction.CREATED, owner.getName());
        return toResponse(savedBook);
    }

    @Transactional
    public BookResponse updateBook(Long bookId, BookUpdateRequest request) {
        Book book = getBookOrThrow(bookId);
        book.setTitle(request.title().trim());
        book.setAuthor(request.author().trim());
        book.setGenre(trimToNull(request.genre()));
        book.setLanguage(trimToNull(request.language()));
        book.setDescription(request.description().trim());
        return toResponse(bookRepository.save(book));
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getBooks(String title, String author, String owner, String borrowedBy, Boolean available, UserRole userRole, Boolean includeInactive) {
        Specification<Book> specification = (root, query, cb) -> {
            // Eager load relationships to avoid lazy loading issues
            if (query != null) {
                query.distinct(true);
                root.fetch("owner", JoinType.LEFT);
                root.fetch("borrowedByUser", JoinType.LEFT);
                root.fetch("lastReaderUser", JoinType.LEFT);
            }
            
            List<Predicate> predicates = new ArrayList<>();
            // Exclude inactive books by default, unless includeInactive is true
            if (includeInactive == null || !includeInactive) {
                predicates.add(cb.equal(root.get("isInactive"), false));
            }
            
            if (StringUtils.hasText(title)) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + title.trim().toLowerCase() + "%"));
            }
            if (StringUtils.hasText(author)) {
                predicates.add(cb.like(cb.lower(root.get("author")), "%" + author.trim().toLowerCase() + "%"));
            }
            if (StringUtils.hasText(owner)) {
                predicates.add(cb.like(cb.lower(root.get("owner").get("name")), "%" + owner.trim().toLowerCase() + "%"));
            }
            if (StringUtils.hasText(borrowedBy)) {
                predicates.add(cb.like(cb.lower(root.get("borrowedByUser").get("name")), "%" + borrowedBy.trim().toLowerCase() + "%"));
            }
            if (available != null) {
                if (available) {
                    predicates.add(cb.isNull(root.get("borrowedByUser")));
                } else {
                    predicates.add(cb.isNotNull(root.get("borrowedByUser")));
                }
            }
            if (userRole != null) {
                predicates.add(cb.equal(root.get("userRole"), userRole));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return bookRepository.findAll(specification).stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteBook(Long bookId, String deletedBy) {        Book book = getBookOrThrow(bookId);
        saveHistory(book, BookHistoryAction.DELETED, trimToNull(deletedBy));
        bookRepository.delete(book);
    }

    @Transactional
    public BookResponse borrowBook(Long bookId, BookBorrowRequest request) {
        Book book = getBookOrThrow(bookId);
        AppUser borrower = appUserRepository.findById(request.borrowedByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Borrower user not found"));
        
        // If book is already borrowed, save the previous borrower as last reader before updating
        if (book.getBorrowedByUser() != null) {
            book.setLastReaderUser(book.getBorrowedByUser());
        }

        saveHistory(book, BookHistoryAction.BORROWED, borrower.getName());

        book.setBorrowedByUser(borrower);
        book.setDateBorrowed(LocalDate.now());
        book.setDateReturned(null);
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookResponse returnBook(Long bookId, BookReturnRequest request) {
        Book book = getBookOrThrow(bookId);
        if (book.getBorrowedByUser() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Book is not currently borrowed");
        }

        saveHistory(book, BookHistoryAction.RETURNED, request.returnedBy().trim());

        book.setLastReaderUser(book.getBorrowedByUser());
        book.setBorrowedByUser(null);
        book.setDateBorrowed(null);
        book.setDateReturned(LocalDate.now());
        return toResponse(bookRepository.save(book));
    }

    @Transactional(readOnly = true)
    public List<BookHistoryResponse> getBookHistory(Long bookId) {
        return bookHistoryRepository.findByBookIdOrderByChangedAtDesc(bookId).stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    @Transactional
    public BookResponse deactivateBook(Long bookId, Long userId, String userRole, String deactivatedBy) {
        Book book = getBookOrThrow(bookId);
        
        // Check access: only book owner or admins can deactivate
        boolean isOwner = book.getOwner().getId().equals(userId);
        boolean isAdmin = "admin".equals(userRole) || "localAdmin".equals(userRole);
        
        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only book owner or admins can deactivate a book");
        }
        
        book.setIsInactive(true);
        saveHistory(book, BookHistoryAction.DELETED, trimToNull(deactivatedBy));
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookResponse activateBook(Long bookId, Long userId, String userRole, String activatedBy) {
        Book book = getBookOrThrow(bookId);
        
        // Check access: only book owner or admins can activate
        boolean isOwner = book.getOwner().getId().equals(userId);
        boolean isAdmin = "admin".equals(userRole) || "localAdmin".equals(userRole);
        
        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only book owner or admins can activate a book");
        }
        
        book.setIsInactive(false);
        saveHistory(book, BookHistoryAction.CREATED, trimToNull(activatedBy));
        return toResponse(bookRepository.save(book));
    }

    private Book getBookOrThrow(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
    }

    private void saveHistory(Book book, BookHistoryAction action, String changedBy) {
        String ownerName = book.getOwner() != null ? book.getOwner().getName() : "Unknown";
        String borrowedByName = book.getBorrowedByUser() != null ? book.getBorrowedByUser().getName() : null;
        String borrowedBySurname = book.getBorrowedByUser() != null ? book.getBorrowedByUser().getSurname() : null;
        String lastReaderName = book.getLastReaderUser() != null ? book.getLastReaderUser().getName() : null;
        
        bookHistoryRepository.save(BookHistory.builder()
                .bookId(book.getId())
                .title(book.getTitle())
                .owner(ownerName)
                .previousBorrowedBy(borrowedByName)
                .previousBorrowedBySurname(borrowedBySurname)
                .previousDateBorrowed(book.getDateBorrowed())
                .previousDateReturned(book.getDateReturned())
                .previousLastReader(lastReaderName)
                .changedBy(trimToNull(changedBy))
                .action(action)
                .changedAt(LocalDateTime.now())
                .build());
    }

    private BookResponse toResponse(Book book) {
        AppUser owner = book.getOwner();
        AppUser borrowedBy = book.getBorrowedByUser();
        AppUser lastReader = book.getLastReaderUser();
        
        return new BookResponse(
                book.getId(),
                owner != null ? owner.getId() : null,
                owner != null ? owner.getName() : null,
                owner != null ? owner.getSurname() : null,
                owner != null ? owner.getContact() : null,
                book.getTitle(),
                book.getAuthor(),
                book.getGenre(),
                book.getLanguage(),
                book.getDescription(),
                book.getDateAdded(),
                book.getDateBorrowed(),
                book.getDateReturned(),
                borrowedBy != null ? borrowedBy.getId() : null,
                borrowedBy != null ? borrowedBy.getName() : null,
                borrowedBy != null ? borrowedBy.getSurname() : null,
                borrowedBy != null ? borrowedBy.getContact() : null,
                lastReader != null ? lastReader.getId() : null,
                lastReader != null ? lastReader.getName() : null,
                lastReader != null ? lastReader.getSurname() : null,
                book.getIsInactive()
        );
    }

    private BookHistoryResponse toHistoryResponse(BookHistory history) {
        return new BookHistoryResponse(
                history.getId(),
                history.getBookId(),
                history.getTitle(),
                history.getOwner(),
                history.getPreviousBorrowedBy(),
                history.getPreviousBorrowedBySurname(),
                history.getPreviousDateBorrowed(),
                history.getPreviousDateReturned(),
                history.getPreviousLastReader(),
                history.getChangedBy(),
                history.getAction(),
                history.getChangedAt()
        );
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
