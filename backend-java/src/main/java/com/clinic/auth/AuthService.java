package com.clinic.auth;

import java.security.MessageDigest;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinic.common.AppException;
import com.clinic.security.JwtService;

import io.jsonwebtoken.Claims;

/** Mirrors backend/src/services/authService.js */
@Service
public class AuthService {

    private final AuthRepository authRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthRepository authRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public LoginResult login(String email, String password, String ip) throws SQLException {
        Map<String, Object> user = authRepository.getUserByEmail(email);
        if (user == null) {
            throw AppException.unauthorized("Invalid email or password.");
        }
        boolean isActive = Boolean.TRUE.equals(user.get("IsActive"));
        if (!isActive) {
            throw AppException.forbidden("This account has been deactivated.");
        }

        String passwordHash = (String) user.get("PasswordHash");
        if (passwordHash == null || !passwordEncoder.matches(password, passwordHash)) {
            throw AppException.unauthorized("Invalid email or password.");
        }

        int userId = ((Number) user.get("UserID")).intValue();
        int roleId = ((Number) user.get("RoleID")).intValue();
        String roleName = (String) user.get("RoleName");

        List<String> permissions = authRepository.getUserPermissions(userId);

        String accessToken = jwtService.signAccessToken(userId, roleId, roleName, permissions);
        String refreshToken = jwtService.signRefreshToken(userId);

        Claims decoded = jwtService.verifyRefreshToken(refreshToken);
        LocalDateTime expiresAt = LocalDateTime.ofInstant(decoded.getExpiration().toInstant(), ZoneId.systemDefault());
        authRepository.createRefreshToken(userId, hashToken(refreshToken), expiresAt, ip);

        authRepository.updateLastLogin(userId);
        authRepository.createAuditLog(userId, "Login", "User", userId, null, null, ip, null);

        Map<String, Object> userView = new java.util.LinkedHashMap<>();
        userView.put("id", userId);
        userView.put("fullName", user.get("FullName"));
        userView.put("email", user.get("Email"));
        userView.put("role", roleName);
        userView.put("avatarUrl", user.get("AvatarUrl"));
        userView.put("permissions", permissions);

        return new LoginResult(accessToken, refreshToken, userView);
    }

    public String refresh(String refreshToken) throws SQLException {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw AppException.unauthorized("Refresh token required.");
        }

        Claims decoded;
        try {
            decoded = jwtService.verifyRefreshToken(refreshToken);
        } catch (Exception e) {
            throw AppException.unauthorized("Invalid or expired refresh token.");
        }

        Map<String, Object> stored = authRepository.getValidRefreshToken(hashToken(refreshToken));
        if (stored == null) {
            throw AppException.unauthorized("Refresh token has been revoked or expired.");
        }

        int userId = ((Number) decoded.get("userId")).intValue();
        Map<String, Object> user = authRepository.getUserById(userId);
        if (user == null || !Boolean.TRUE.equals(user.get("IsActive"))) {
            throw AppException.unauthorized("Account not available.");
        }

        int roleId = ((Number) user.get("RoleID")).intValue();
        String roleName = (String) user.get("RoleName");
        List<String> permissions = authRepository.getUserPermissions(userId);

        return jwtService.signAccessToken(userId, roleId, roleName, permissions);
    }

    public void logout(String refreshToken, Integer userId) throws SQLException {
        if (refreshToken != null && !refreshToken.isBlank()) {
            authRepository.revokeRefreshToken(hashToken(refreshToken));
        }
        authRepository.createAuditLog(userId, "Logout", "User", userId, null, null, null, null);
    }

    public void changePassword(int userId, String currentPassword, String newPassword) throws SQLException {
        Map<String, Object> user = authRepository.getUserById(userId);
        if (user == null) {
            throw AppException.notFound("User not found.");
        }

        Map<String, Object> full = authRepository.getUserByEmail((String) user.get("Email"));
        String passwordHash = (String) full.get("PasswordHash");
        if (!passwordEncoder.matches(currentPassword, passwordHash)) {
            throw AppException.badRequest("Current password is incorrect.");
        }

        String newHash = passwordEncoder.encode(newPassword);
        authRepository.changePassword(userId, newHash);
        authRepository.createAuditLog(userId, "Update", "User.Password", userId, null, null, null, null);
    }

    public Map<String, Object> getMe(int userId) throws SQLException {
        Map<String, Object> user = authRepository.getUserById(userId);
        if (user == null) {
            throw AppException.notFound("User not found.");
        }
        List<String> permissions = authRepository.getUserPermissions(userId);
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("id", userId);
        result.put("fullName", user.get("FullName"));
        result.put("email", user.get("Email"));
        result.put("role", user.get("RoleName"));
        result.put("avatarUrl", user.get("AvatarUrl"));
        result.put("permissions", permissions);
        return result;
    }

    /** DTO mirroring authService.login()'s return object. */
    public record LoginResult(String accessToken, String refreshToken, Map<String, Object> user) {}
}
