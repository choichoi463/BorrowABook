package com.example.borrowabook.controller;

import com.example.borrowabook.dto.UserAdminResponse;
import com.example.borrowabook.service.UserAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    @GetMapping
    public List<UserAdminResponse> getAllUsers() {
        return userAdminService.getAllUsers();
    }

    @GetMapping("/{userId}")
    public UserAdminResponse getUserById(@PathVariable Long userId) {
        return userAdminService.getUserById(userId);
    }

    @PutMapping("/{userId}/activate")
    public UserAdminResponse activateUser(@PathVariable Long userId) {
        return userAdminService.setUserActive(userId, true);
    }

    @PutMapping("/{userId}/deactivate")
    public UserAdminResponse deactivateUser(@PathVariable Long userId) {
        return userAdminService.setUserActive(userId, false);
    }
}

