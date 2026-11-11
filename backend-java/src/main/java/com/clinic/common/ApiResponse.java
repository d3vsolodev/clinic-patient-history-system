package com.clinic.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Mirrors backend/src/utils/apiResponse.js response shape. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private final boolean success;
    private final String message;
    private final T data;
    private final Object meta;

    private ApiResponse(boolean success, String message, T data, Object meta) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.meta = meta;
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static <T> ApiResponse<T> success(String message, T data, Object meta) {
        return new ApiResponse<>(true, message, data, meta);
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public Object getMeta() { return meta; }
}
