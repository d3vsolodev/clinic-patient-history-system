package com.clinic.dashboard;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.clinic.db.SqlParam;
import com.clinic.db.StoredProcExecutor;

/** Mirrors backend/src/repositories/dashboardRepository.js */
@Repository
public class DashboardRepository {

    private final StoredProcExecutor exec;

    public DashboardRepository(StoredProcExecutor exec) {
        this.exec = exec;
    }

    public Map<String, Object> getSummary() throws SQLException {
        List<Map<String, Object>> rs = exec.executeSingle("sp_Dashboard_GetSummary", new LinkedHashMap<>());
        return rs.isEmpty() ? null : rs.get(0);
    }

    public List<Map<String, Object>> getPatientRegistrationTrend(int months) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("Months", SqlParam.ofInt(months));
        return exec.executeSingle("sp_Dashboard_GetPatientRegistrationTrend", params);
    }

    public List<Map<String, Object>> getAppointmentTrend(int days) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("Days", SqlParam.ofInt(days));
        return exec.executeSingle("sp_Dashboard_GetAppointmentTrend", params);
    }

    public List<Map<String, Object>> getRevenueTrend(int months) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("Months", SqlParam.ofInt(months));
        return exec.executeSingle("sp_Dashboard_GetRevenueTrend", params);
    }

    public List<Map<String, Object>> getGenderDistribution() throws SQLException {
        return exec.executeSingle("sp_Dashboard_GetGenderDistribution", new LinkedHashMap<>());
    }

    public List<Map<String, Object>> getCommonDiagnoses(int top) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("Top", SqlParam.ofInt(top));
        return exec.executeSingle("sp_Dashboard_GetCommonDiagnoses", params);
    }
}
