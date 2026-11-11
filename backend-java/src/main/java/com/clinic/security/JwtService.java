package com.clinic.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/** Mirrors backend/src/utils/tokens.js */
@Component
public class JwtService {

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessExpiresInMillis;
    private final long refreshExpiresInMillis;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.refreshSecret}") String refreshSecret,
            @Value("${jwt.expiresInMinutes}") long expiresInMinutes,
            @Value("${jwt.refreshExpiresInDays}") long refreshExpiresInDays) {
        this.accessKey = Keys.hmacShaKeyFor(requireKey(secret, "JWT_SECRET"));
        this.refreshKey = Keys.hmacShaKeyFor(requireKey(refreshSecret, "JWT_REFRESH_SECRET"));
        if (secret.equals(refreshSecret)) {
            throw new IllegalArgumentException("JWT access and refresh secrets must be different");
        }
        this.accessExpiresInMillis = expiresInMinutes * 60_000;
        this.refreshExpiresInMillis = refreshExpiresInDays * 24 * 60 * 60_000;
    }

    // HMAC-SHA256 requires a key of at least 256 bits (32 bytes).
    private byte[] requireKey(String secret, String name) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalArgumentException(name + " must be at least 32 UTF-8 bytes");
        }
        return bytes;
    }

    public String signAccessToken(int userId, int roleId, String roleName, List<String> permissions) {
        Date now = new Date();
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("userId", userId);
        claims.put("roleId", roleId);
        claims.put("roleName", roleName);
        claims.put("permissions", permissions);

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessExpiresInMillis))
                .signWith(accessKey)
                .compact();
    }

    public String signRefreshToken(int userId) {
        Date now = new Date();
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("userId", userId);

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshExpiresInMillis))
                .signWith(refreshKey)
                .compact();
    }

    public Claims verifyAccessToken(String token) {
        return Jwts.parser().verifyWith(accessKey).build().parseSignedClaims(token).getPayload();
    }

    public Claims verifyRefreshToken(String token) {
        return Jwts.parser().verifyWith(refreshKey).build().parseSignedClaims(token).getPayload();
    }

    public long getRefreshExpiresInMillis() { return refreshExpiresInMillis; }
}
