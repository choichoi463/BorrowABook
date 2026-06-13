package com.example.borrowabook.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class EmailTemplateService {

    public String render(String templatePath, Map<String, String> placeholders) {
        String content = loadTemplate(templatePath);
        String rendered = content;
        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            String token = "{{" + entry.getKey() + "}}";
            rendered = rendered.replace(token, entry.getValue() == null ? "" : entry.getValue());
        }
        return rendered;
    }

    private String loadTemplate(String templatePath) {
        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            byte[] bytes = resource.getInputStream().readAllBytes();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Cannot load email template: " + templatePath, ex);
        }
    }
}

