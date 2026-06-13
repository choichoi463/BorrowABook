package com.example.borrowabook.repository;

import com.example.borrowabook.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByLoginIgnoreCase(String login);

    Optional<AppUser> findByLoginIgnoreCase(String login);

    Optional<AppUser> findByEmailIgnoreCase(String email);
}

