package com.clinic.config;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Simple in-memory fixed-window rate limiter, mirroring the express-rate-limit
 * configuration in backend/src/app.js (500 requests / 15 minutes per IP, applied
 * to all /api/** routes). For multi-instance deployments, replace with a shared
 * store (e.g. Redis / Bucket4j-Redis).
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 500;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000L;

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    private static class Window {
        volatile long windowStart;
        final AtomicInteger count = new AtomicInteger(0);
        Window(long start) { this.windowStart = start; }
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        if (!request.getRequestURI().startsWith("/api")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = clientIp(request);
        long now = System.currentTimeMillis();
        Window window = windows.computeIfAbsent(ip, k -> new Window(now));

        synchronized (window) {
            if (now - window.windowStart > WINDOW_MILLIS) {
                window.windowStart = now;
                window.count.set(0);
            }
            int current = window.count.incrementAndGet();
            response.setHeader("RateLimit-Limit", String.valueOf(MAX_REQUESTS));
            response.setHeader("RateLimit-Remaining", String.valueOf(Math.max(0, MAX_REQUESTS - current)));
            if (current > MAX_REQUESTS) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Too many requests, please try again later.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
