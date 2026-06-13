package com.example.borrowabook.service;

import com.example.borrowabook.dto.ForgotPasswordRequest;
import com.example.borrowabook.dto.LoginUserRequest;
import com.example.borrowabook.dto.LoginUserResponse;
import com.example.borrowabook.dto.RegisterUserRequest;
import com.example.borrowabook.dto.UpdateUserProfileRequest;
import com.example.borrowabook.model.UserRole;
import com.example.borrowabook.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class UserLoginServiceTest {

    @Autowired
    private UserRegistrationService userRegistrationService;

    @Autowired
    private UserLoginService userLoginService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void loginReturnsUserDataForValidCredentials() {
        userRegistrationService.register(new RegisterUserRequest(
                "login-test@example.com",
                null,
                "login-test-user",
                "StrongPassword123",
                "Jane",
                "Reader",
                UserRole.bookOwner
        ));

        LoginUserResponse response = userLoginService.login(new LoginUserRequest("login-test-user", "StrongPassword123"));

        assertThat(response.id()).isNotNull();
        assertThat(response.email()).isEqualTo("login-test@example.com");
        assertThat(response.login()).isEqualTo("login-test-user");
        assertThat(response.userRole()).isEqualTo(UserRole.bookOwner);
    }

    @Test
    void loginThrowsUnauthorizedForInvalidPassword() {
        userRegistrationService.register(new RegisterUserRequest(
                "wrong-pass@example.com",
                null,
                "wrong-pass-user",
                "CorrectPassword123",
                "Jim",
                "Reader",
                UserRole.localAdmin
        ));

        assertThatThrownBy(() -> userLoginService.login(new LoginUserRequest("wrong-pass-user", "WrongPassword")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("401 UNAUTHORIZED");
    }

    @Test
    void forgotPasswordReplacesPasswordHashAndInvalidatesOldPassword() {
        userRegistrationService.register(new RegisterUserRequest(
                "forgot-pass@example.com",
                null,
                "forgot-pass-user",
                "InitialPassword123",
                "Mia",
                "Reader",
                UserRole.bookOwner
        ));

        String oldHash = appUserRepository.findByLoginIgnoreCase("forgot-pass-user")
                .orElseThrow()
                .getPasswordHash();

        userLoginService.forgotPassword(new ForgotPasswordRequest("forgot-pass@example.com"));

        String newHash = appUserRepository.findByLoginIgnoreCase("forgot-pass-user")
                .orElseThrow()
                .getPasswordHash();

        assertThat(newHash).isNotEqualTo(oldHash);
        assertThatThrownBy(() -> userLoginService.login(new LoginUserRequest("forgot-pass-user", "InitialPassword123")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("401 UNAUTHORIZED");
    }

    @Test
    void updateProfileUpdatesEditableFieldsAndKeepsLogin() {
        var registration = userRegistrationService.register(new RegisterUserRequest(
                "profile-update@example.com",
                "+1-202-555-0100",
                "profile-user",
                "StrongPassword123",
                "Jane",
                "Reader",
                UserRole.bookOwner
        ));

        LoginUserResponse updated = userLoginService.updateProfile(
                registration.id(),
                new UpdateUserProfileRequest(
                        "profile-updated@example.com",
                        "+1-202-555-9999",
                        "Janet",
                        "Updated"
                )
        );

        assertThat(updated.email()).isEqualTo("profile-updated@example.com");
        assertThat(updated.contact()).isEqualTo("+1-202-555-9999");
        assertThat(updated.name()).isEqualTo("Janet");
        assertThat(updated.surname()).isEqualTo("Updated");
        assertThat(updated.login()).isEqualTo("profile-user");

        var saved = appUserRepository.findById(registration.id()).orElseThrow();
        assertThat(saved.getLogin()).isEqualTo("profile-user");
    }
}
