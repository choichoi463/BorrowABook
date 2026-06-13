package com.example.borrowabook.service;

import com.example.borrowabook.dto.RegisterUserRequest;
import com.example.borrowabook.dto.RegisterUserResponse;
import com.example.borrowabook.model.AppUser;
import com.example.borrowabook.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserRegistrationService {

    private final AppUserRepository appUserRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final AuthEmailService authEmailService;

    @Value("${app.user.active-on-registration:true}")
    private boolean activeOnRegistration;

    @Transactional
    public RegisterUserResponse register(RegisterUserRequest request) {
        if (appUserRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        if (appUserRepository.existsByLoginIgnoreCase(request.login())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Login is already taken");
        }

        AppUser savedUser = appUserRepository.save(
                AppUser.builder()
                        .email(request.email().trim())
                        .contact(request.contact())
                        .login(request.login().trim())
                        .passwordHash(passwordEncoder.encode(request.password()))
                        .name(request.name().trim())
                        .surname(request.surname().trim())
                        .userRole(request.userRole())
                        .isActive(activeOnRegistration)
                        .build()
        );

        authEmailService.sendRegistrationCredentials(savedUser, request.password());

        return new RegisterUserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getContact(),
                savedUser.getLogin(),
                savedUser.getName(),
                savedUser.getSurname(),
                savedUser.getUserRole(),
                savedUser.getIsActive()
        );
    }
}

