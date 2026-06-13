package com.example.borrowabook.controller;

import com.example.borrowabook.dto.ForgotPasswordRequest;
import com.example.borrowabook.dto.LoginUserRequest;
import com.example.borrowabook.dto.LoginUserResponse;
import com.example.borrowabook.dto.UpdateUserProfileRequest;
import com.example.borrowabook.service.UserLoginService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserLoginController {

    private final UserLoginService userLoginService;

    @PostMapping("/login")
    public LoginUserResponse login(@Valid @RequestBody LoginUserRequest request) {
        return userLoginService.login(request);
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userLoginService.forgotPassword(request);
    }

    @PutMapping("/{userId}")
    public LoginUserResponse updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        return userLoginService.updateProfile(userId, request);
    }
}
