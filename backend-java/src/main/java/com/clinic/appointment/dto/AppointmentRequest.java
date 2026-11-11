package com.clinic.appointment.dto;

import jakarta.validation.constraints.NotNull;

public class AppointmentRequest {

    @NotNull(message = "is required")
    private Integer patientId;

    @NotNull(message = "is required")
    private Integer doctorId;

    private Integer departmentId;

    @NotNull(message = "is required")
    private String appointmentDate; // ISO datetime string

    private Integer durationMinutes;
    private String reason;
    private String notes;

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }
    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public Integer getDepartmentId() { return departmentId; }
    public void setDepartmentId(Integer departmentId) { this.departmentId = departmentId; }
    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
