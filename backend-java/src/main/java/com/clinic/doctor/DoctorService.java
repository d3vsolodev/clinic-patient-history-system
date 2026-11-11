package com.clinic.doctor;

import java.sql.SQLException;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.clinic.common.AppException;
import com.clinic.common.PagedResult;

/** Mirrors backend/src/services/doctorService.js */
@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public PagedResult list(String search, Integer departmentId, String status, int page, int pageSize) throws SQLException {
        if ((search != null && !search.isBlank()) || departmentId != null || (status != null && !status.isBlank())) {
            return doctorRepository.search(search, departmentId, status, page, pageSize);
        }
        return doctorRepository.getAll(page, pageSize);
    }

    public Map<String, Object> getById(int doctorId) throws SQLException {
        Map<String, Object> doctor = doctorRepository.getById(doctorId);
        if (doctor == null) throw AppException.notFound("Doctor not found.");
        return doctor;
    }

    public Map<String, Object> create(Map<String, Object> data) throws SQLException {
        return doctorRepository.create(data);
    }

    public Map<String, Object> update(int doctorId, Map<String, Object> data) throws SQLException {
        getById(doctorId);
        return doctorRepository.update(doctorId, data);
    }

    public void remove(int doctorId) throws SQLException {
        getById(doctorId);
        doctorRepository.remove(doctorId);
    }

    public Object getAppointments(int doctorId, String fromDate, String toDate) throws SQLException {
        return doctorRepository.getAppointments(doctorId, fromDate, toDate);
    }

    public Object getPatients(int doctorId) throws SQLException {
        return doctorRepository.getPatients(doctorId);
    }
}
