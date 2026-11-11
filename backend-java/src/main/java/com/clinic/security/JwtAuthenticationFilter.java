package com.clinic.security;

import java.io.IOException;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Reads the "Authorization: Bearer <token>" header, verifies it, and (if
 * valid) sets a CurrentUser principal on the SecurityContext, matching
 * backend/src/middleware/authenticate.js. Requests without a valid token
 * simply proceed unauthenticated; SecurityConfig decides which routes
 * require authentication.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;

        if (token != null) {
            try {
                Claims claims = jwtService.verifyAccessToken(token);
                int userId = ((Number) claims.get("userId")).intValue();
                int roleId = ((Number) claims.get("roleId")).intValue();
                String roleName = (String) claims.get("roleName");
                List<String> permissions = (List<String>) claims.get("permissions");
                CurrentUser currentUser = new CurrentUser(userId, roleId, roleName,
                        permissions == null ? List.of() : permissions);

                var authentication = new UsernamePasswordAuthenticationToken(currentUser, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ex) {
                // Invalid/expired token: leave unauthenticated; SecurityConfig will 401 on protected routes.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
