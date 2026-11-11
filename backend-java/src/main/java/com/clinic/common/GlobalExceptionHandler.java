package com.clinic.common;

import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

/** Mirrors backend/src/middleware/errorHandler.js */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(new ErrorResponse(ex.getMessage(), ex.getErrors()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + " " + fe.getDefaultMessage() + ".")
                .collect(Collectors.toList());
        return ResponseEntity.status(422).body(new ErrorResponse("Validation failed.", errors));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(401).body(new ErrorResponse("Invalid or expired token.", List.of()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(403)
                .body(new ErrorResponse("You do not have permission to perform this action.", List.of()));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoHandlerFoundException ex) {
        return ResponseEntity.status(404)
                .body(new ErrorResponse("Route not found: " + ex.getHttpMethod() + " " + ex.getRequestURL(), List.of()));
    }

    @ExceptionHandler(SQLException.class)
    public ResponseEntity<ErrorResponse> handleSql(SQLException ex) {
        // Never leak raw SQL error details to the client.
        log.error("[SQL ERROR] {}", ex.getMessage());
        return ResponseEntity.status(400)
                .body(new ErrorResponse("Unable to complete the request due to a data error.", List.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("[UNHANDLED ERROR]", ex);
        return ResponseEntity.status(500).body(new ErrorResponse("An unexpected error occurred.", List.of()));
    }

    /** Serializes to { success:false, message, errors } - mirrors errorHandler.js output. */
    public static class ErrorResponse {
        private final boolean success = false;
        private final String message;
        private final List<String> errors;

        public ErrorResponse(String message, List<String> errors) {
            this.message = message;
            this.errors = errors;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public List<String> getErrors() { return errors; }
    }
}
