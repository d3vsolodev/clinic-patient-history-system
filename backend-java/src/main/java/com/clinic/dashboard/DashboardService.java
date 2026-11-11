package com.clinic.dashboard;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

/** Mirrors backend/src/services/dashboardService.js */
@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public Map<String, Object> getDashboard() throws SQLException {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("summary", dashboardRepository.getSummary());
        result.put("patientTrend", dashboardRepository.getPatientRegistrationTrend(6));
        result.put("appointmentTrend", dashboardRepository.getAppointmentTrend(7));
        result.put("revenueTrend", dashboardRepository.getRevenueTrend(6));
        result.put("genderDistribution", dashboardRepository.getGenderDistribution());
        result.put("commonDiagnoses", dashboardRepository.getCommonDiagnoses(5));
        return result;
    }
}
