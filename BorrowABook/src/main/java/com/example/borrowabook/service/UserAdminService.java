package com.example.borrowabook.service;

import com.example.borrowabook.dto.UserAdminResponse;
import com.example.borrowabook.model.AppUser;
import com.example.borrowabook.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final AppUserRepository appUserRepository;

    @Transactional(readOnly = true)
    public List<UserAdminResponse> getAllUsers() {
        return appUserRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserAdminResponse getUserById(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    @Transactional
    public UserAdminResponse setUserActive(Long userId, boolean active) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setIsActive(active);
        return toResponse(appUserRepository.save(user));
    }

    private UserAdminResponse toResponse(AppUser user) {
        return new UserAdminResponse(
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
}

