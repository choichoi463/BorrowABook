package com.example.borrowabook.service;

import com.example.borrowabook.dto.ForgotPasswordRequest;
import com.example.borrowabook.dto.LoginUserRequest;
import com.example.borrowabook.dto.LoginUserResponse;
import com.example.borrowabook.dto.UpdateUserProfileRequest;
import com.example.borrowabook.model.AppUser;
import com.example.borrowabook.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class UserLoginService {

    private static final String TEMP_PASSWORD_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthEmailService authEmailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public LoginUserResponse login(LoginUserRequest request) {
        AppUser user = appUserRepository.findByLoginIgnoreCase(request.login().trim())
                .orElseThrow(() -> invalidCredentials());

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is not yet activated. Please contact your administrator.");
        }

        return toResponse(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        appUserRepository.findByEmailIgnoreCase(request.email().trim())
                .ifPresent(user -> {
                    String temporaryPassword = generateTemporaryPassword(12);
                    user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
                    appUserRepository.save(user);
                    authEmailService.sendForgotPasswordTemporaryPassword(user, temporaryPassword);
                });
    }

    private String generateTemporaryPassword(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = secureRandom.nextInt(TEMP_PASSWORD_CHARSET.length());
            builder.append(TEMP_PASSWORD_CHARSET.charAt(index));
        }
        return builder.toString();
    }

    @Transactional
    public LoginUserResponse updateProfile(Long userId, UpdateUserProfileRequest request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String normalizedEmail = request.email().trim();
        appUserRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter(existing -> !existing.getId().equals(userId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
                });

        user.setEmail(normalizedEmail);
        user.setContact(trimToNull(request.contact()));
        user.setName(request.name().trim());
        user.setSurname(request.surname().trim());

        AppUser saved = appUserRepository.save(user);
        return toResponse(saved);
    }

    private LoginUserResponse toResponse(AppUser user) {
        return new LoginUserResponse(
                user.getId(),
                user.getEmail(),
                user.getContact(),
                user.getLogin(),
                user.getName(),
                user.getSurname(),
                user.getUserRole(),
                user.getIsActive()
        );
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
}
