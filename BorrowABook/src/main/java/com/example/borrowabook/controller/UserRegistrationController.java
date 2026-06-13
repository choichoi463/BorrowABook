package com.example.borrowabook.controller;

import com.example.borrowabook.dto.RegisterUserRequest;
import com.example.borrowabook.dto.RegisterUserResponse;
import com.example.borrowabook.service.UserRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserRegistrationController {

    private final UserRegistrationService userRegistrationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterUserResponse register(@Valid @RequestBody RegisterUserRequest request) {
        return userRegistrationService.register(request);
    }
}

