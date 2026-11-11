package com.clinic.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {

    @NotBlank(message = "is required")
    @Size(min = 4, message = "must be at least 4 characters")
    private String currentPassword;

    @NotBlank(message = "is required")
    @Size(min = 6, message = "must be at least 6 characters")
    private String newPassword;

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
