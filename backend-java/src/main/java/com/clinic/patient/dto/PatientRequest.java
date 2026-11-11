package com.clinic.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class PatientRequest {

    @NotBlank(message = "is required")
    private String firstName;

    @NotBlank(message = "is required")
    private String lastName;

    @NotBlank(message = "is required")
    private String dateOfBirth; // yyyy-MM-dd

    @NotBlank(message = "is required")
    @Pattern(regexp = "Male|Female|Other", message = "must be one of Male, Female, Other")
    private String gender;

    private String bloodType;
    private String phone;

    @Email(message = "must be a valid email")
    private String email;

    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;

    @Pattern(regexp = "Active|Inactive", message = "must be one of Active, Inactive")
    private String status;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
