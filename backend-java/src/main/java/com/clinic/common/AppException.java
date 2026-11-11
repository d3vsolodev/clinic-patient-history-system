package com.clinic.common;

import java.util.Collections;
import java.util.List;

/** Mirrors backend/src/utils/AppError.js - an operational, expected error with an HTTP status. */
public class AppException extends RuntimeException {

    private final int statusCode;
    private final List<String> errors;

    public AppException(String message) {
        this(message, 400, Collections.emptyList());
    }

    public AppException(String message, int statusCode) {
        this(message, statusCode, Collections.emptyList());
    }

    public AppException(String message, int statusCode, List<String> errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }

    public int getStatusCode() { return statusCode; }
    public List<String> getErrors() { return errors; }

    public static AppException notFound(String message) { return new AppException(message, 404); }
    public static AppException badRequest(String message) { return new AppException(message, 400); }
    public static AppException unauthorized(String message) { return new AppException(message, 401); }
    public static AppException forbidden(String message) { return new AppException(message, 403); }
    public static AppException conflict(String message) { return new AppException(message, 409); }
}
