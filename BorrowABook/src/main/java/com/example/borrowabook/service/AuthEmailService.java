package com.example.borrowabook.service;

import com.example.borrowabook.model.AppUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthEmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final EmailTemplateService emailTemplateService;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@borrowabook.local}")
    private String fromEmail;

    @Value("${app.frontend.login-url:http://localhost:3000/login}")
    private String loginUrl;

    public void sendRegistrationCredentials(AppUser user, String rawPassword) {
        Map<String, String> placeholders = commonPlaceholders(user);
        placeholders.put("password", rawPassword);

        sendEmail(
                user.getEmail(),
                emailTemplateService.render("email-templates/registration-subject.txt", placeholders).trim(),
                emailTemplateService.render("email-templates/registration-body.txt", placeholders)
        );
    }

    public void sendForgotPasswordTemporaryPassword(AppUser user, String temporaryPassword) {
        Map<String, String> placeholders = commonPlaceholders(user);
        placeholders.put("temporaryPassword", temporaryPassword);
        placeholders.put("loginUrl", loginUrl);

        sendEmail(
                user.getEmail(),
                emailTemplateService.render("email-templates/forgot-password-subject.txt", placeholders).trim(),
                emailTemplateService.render("email-templates/forgot-password-body.txt", placeholders)
        );
    }

    private Map<String, String> commonPlaceholders(AppUser user) {
        Map<String, String> placeholders = new HashMap<>();
        placeholders.put("name", user.getName());
        placeholders.put("surname", user.getSurname());
        placeholders.put("login", user.getLogin());
        placeholders.put("email", user.getEmail());
        return placeholders;
    }

    private void sendEmail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("Skipping email to {} because app.mail.enabled=false", to);
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Skipping email to {} because JavaMailSender is not configured", to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}

