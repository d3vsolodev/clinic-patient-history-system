package com.clinic.appointment;

import java.sql.SQLException;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.clinic.appointment.dto.AppointmentRequest;
import com.clinic.common.AppException;
import com.clinic.common.PagedResult;

/** Mirrors backend/src/services/appointmentService.js */
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public PagedResult list(int pageNumber, int pageSize, Integer doctorId, String status, String fromDate, String toDate) throws SQLException {
        return appointmentRepository.getAll(pageNumber, pageSize, doctorId, status, fromDate, toDate);
    }

    public Map<String, Object> getById(int appointmentId) throws SQLException {
        Map<String, Object> appointment = appointmentRepository.getById(appointmentId);
        if (appointment == null) throw AppException.notFound("Appointment not found.");
        return appointment;
    }

    public Map<String, Object> create(AppointmentRequest data, int userId) throws SQLException {
        try {
            return appointmentRepository.create(data, userId);
        } catch (SQLException ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("already has an appointment")) {
                throw AppException.conflict("This doctor already has an appointment in the selected time slot.");
            }
            throw ex;
        }
    }

    public Map<String, Object> update(int appointmentId, AppointmentRequest data) throws SQLException {
        getById(appointmentId);
        return appointmentRepository.update(appointmentId, data);
    }

    public Map<String, Object> cancel(int appointmentId) throws SQLException {
        getById(appointmentId);
        return appointmentRepository.setStatus(appointmentId, "sp_Appointment_Cancel");
    }

    public Map<String, Object> confirm(int appointmentId) throws SQLException {
        getById(appointmentId);
        return appointmentRepository.setStatus(appointmentId, "sp_Appointment_Confirm");
    }

    public Map<String, Object> checkIn(int appointmentId) throws SQLException {
        getById(appointmentId);
        return appointmentRepository.setStatus(appointmentId, "sp_Appointment_CheckIn");
    }

    public Map<String, Object> complete(int appointmentId) throws SQLException {
        getById(appointmentId);
        return appointmentRepository.setStatus(appointmentId, "sp_Appointment_Complete");
    }
}
