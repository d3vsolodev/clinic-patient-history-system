package com.clinic.auth;

import java.sql.SQLException;
import java.util.Map;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.auth.dto.ChangePasswordRequest;
import com.clinic.auth.dto.LoginRequest;
import com.clinic.common.ApiResponse;
import com.clinic.security.PermissionGuard;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/** Mirrors backend/src/controllers/authController.js and backend/src/routes/authRoutes.js */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE = "refreshToken";

    @org.springframework.beans.factory.annotation.Value("${auth.cookie.secure:false}")
    private boolean secureCookies;

    private final AuthService authService;
    private final PermissionGuard permissionGuard;

    public AuthController(AuthService authService, PermissionGuard permissionGuard) {
        this.authService = authService;
        this.permissionGuard = permissionGuard;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest body,
                                                                    HttpServletRequest request) throws SQLException {
        AuthService.LoginResult result = authService.login(body.getEmail(), body.getPassword(), clientIp(request));

        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, result.refreshToken())
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(java.time.Duration.ofDays(7))
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", cookie.toString())
                .body(ApiResponse.success("Login successful.",
                        Map.of("accessToken", result.accessToken(), "user", result.user())));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refresh(
            @CookieValue(value = REFRESH_COOKIE, required = false) String refreshTokenCookie,
            @RequestBody(required = false) Map<String, Object> body) throws SQLException {
        String refreshToken = refreshTokenCookie != null ? refreshTokenCookie
                : (body != null ? (String) body.get("refreshToken") : null);
        String accessToken = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed.", Map.of("accessToken", accessToken)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout(
            @CookieValue(value = REFRESH_COOKIE, required = false) String refreshTokenCookie) throws SQLException {
        Integer userId = null;
        try {
            userId = permissionGuard.currentUser().userId();
        } catch (Exception ignored) {
            // logout is tolerant of an already-expired access token
        }
        authService.logout(refreshTokenCookie, userId);

        ResponseCookie cleared = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", cleared.toString())
                .body(ApiResponse.success("Logged out.", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me() throws SQLException {
        int userId = permissionGuard.currentUser().userId();
        return ResponseEntity.ok(ApiResponse.success("Current user.", authService.getMe(userId)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Object>> changePassword(@Valid @RequestBody ChangePasswordRequest body) throws SQLException {
        int userId = permissionGuard.currentUser().userId();
        authService.changePassword(userId, body.getCurrentPassword(), body.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully.", null));
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
