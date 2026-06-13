package com.example.borrowabook.service;

import com.example.borrowabook.dto.RegisterUserRequest;
import com.example.borrowabook.dto.RegisterUserResponse;
import com.example.borrowabook.model.UserRole;
import com.example.borrowabook.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UserRegistrationServiceTest {

    @Autowired
    private UserRegistrationService userRegistrationService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void registerStoresUserAndReturnsSanitizedResponse() {
        RegisterUserRequest request = new RegisterUserRequest(
                "reader@example.com",
                "+1-202-555-0188",
                "reader1",
                "superSecret123",
                "John",
                "Doe",
                UserRole.bookOwner
        );

        RegisterUserResponse response = userRegistrationService.register(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.email()).isEqualTo("reader@example.com");
        assertThat(response.login()).isEqualTo("reader1");

        var saved = appUserRepository.findById(response.id());
        assertThat(saved).isPresent();
        assertThat(saved.get().getPasswordHash()).isNotEqualTo("superSecret123");
        assertThat(saved.get().getUserRole()).isEqualTo(UserRole.bookOwner);
    }
}

