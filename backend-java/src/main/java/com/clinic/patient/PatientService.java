package com.clinic.patient;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.clinic.auth.AuthRepository;
import com.clinic.common.AppException;
import com.clinic.common.PagedResult;
import com.clinic.patient.dto.PatientRequest;

/** Mirrors backend/src/services/patientService.js */
@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AuthRepository authRepository;

    public PatientService(PatientRepository patientRepository, AuthRepository authRepository) {
        this.patientRepository = patientRepository;
        this.authRepository = authRepository;
    }

    public PagedResult list(String search, String gender, String status, int page, int pageSize) throws SQLException {
        if ((search != null && !search.isBlank()) || (gender != null && !gender.isBlank()) || (status != null && !status.isBlank())) {
            return patientRepository.search(search, gender, status, page, pageSize);
        }
        return patientRepository.getAll(page, pageSize);
    }

    public Map<String, Object> getById(int patientId) throws SQLException {
        Map<String, Object> patient = patientRepository.getById(patientId);
        if (patient == null) throw AppException.notFound("Patient not found.");
        return patient;
    }

    public Map<String, Object> create(PatientRequest data, int userId) throws SQLException {
        return patientRepository.create(data, userId);
    }

    public Map<String, Object> update(int patientId, PatientRequest data, int userId) throws SQLException {
        getById(patientId);
        return patientRepository.update(patientId, data, userId);
    }

    public void remove(int patientId, int userId) throws SQLException {
        getById(patientId);
        patientRepository.remove(patientId, userId);
        authRepository.createAuditLog(userId, "Delete", "Patient", patientId, null, null, null, null);
    }

    public Map<String, Object> getProfile(int patientId) throws SQLException {
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("patient", getById(patientId));
        profile.put("medicalHistory", patientRepository.getMedicalHistory(patientId));
        profile.put("appointments", patientRepository.getAppointments(patientId));
        profile.put("prescriptions", patientRepository.getPrescriptions(patientId));
        profile.put("labResults", patientRepository.getLabResults(patientId));
        profile.put("billing", patientRepository.getBilling(patientId));
        profile.put("timeline", patientRepository.getTimeline(patientId));
        return profile;
    }

    public Object getTimeline(int patientId) throws SQLException { return patientRepository.getTimeline(patientId); }
    public Object getMedicalHistory(int patientId) throws SQLException { return patientRepository.getMedicalHistory(patientId); }
    public Object getAppointments(int patientId) throws SQLException { return patientRepository.getAppointments(patientId); }
    public Object getPrescriptions(int patientId) throws SQLException { return patientRepository.getPrescriptions(patientId); }
    public Object getLabResults(int patientId) throws SQLException { return patientRepository.getLabResults(patientId); }
    public Object getBilling(int patientId) throws SQLException { return patientRepository.getBilling(patientId); }
}
