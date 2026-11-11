package com.clinic.config;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Mirrors the /health route in backend/src/app.js */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "clinic-patient-history-system-api");
    }
}
