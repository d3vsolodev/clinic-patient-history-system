package com.clinic.doctor;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.clinic.common.MapUtils;
import com.clinic.common.PagedResult;
import com.clinic.db.SqlParam;
import com.clinic.db.StoredProcExecutor;

/** Mirrors backend/src/repositories/doctorRepository.js */
@Repository
public class DoctorRepository {

    private final StoredProcExecutor exec;

    public DoctorRepository(StoredProcExecutor exec) {
        this.exec = exec;
    }

    public PagedResult getAll(int pageNumber, int pageSize) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PageNumber", SqlParam.ofInt(pageNumber));
        params.put("PageSize", SqlParam.ofInt(pageSize));
        return PagedResult.fromRecordset(exec.executeSingle("sp_Doctor_GetAll", params));
    }

    public PagedResult search(String searchTerm, Integer departmentId, String status, int pageNumber, int pageSize) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("SearchTerm", SqlParam.ofVarchar(searchTerm));
        params.put("DepartmentID", SqlParam.ofInt(departmentId));
        params.put("Status", SqlParam.ofVarchar(status));
        params.put("PageNumber", SqlParam.ofInt(pageNumber));
        params.put("PageSize", SqlParam.ofInt(pageSize));
        return PagedResult.fromRecordset(exec.executeSingle("sp_Doctor_Search", params));
    }

    public Map<String, Object> getById(int doctorId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DoctorID", SqlParam.ofInt(doctorId));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Doctor_GetById", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public Map<String, Object> create(Map<String, Object> data) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DepartmentID", SqlParam.ofInt(MapUtils.getInt(data, "departmentId")));
        params.put("FirstName", SqlParam.ofVarchar(MapUtils.getString(data, "firstName")));
        params.put("LastName", SqlParam.ofVarchar(MapUtils.getString(data, "lastName")));
        params.put("Gender", SqlParam.ofVarchar(MapUtils.getString(data, "gender")));
        params.put("Specialization", SqlParam.ofVarchar(MapUtils.getString(data, "specialization")));
        params.put("LicenseNumber", SqlParam.ofVarchar(MapUtils.getString(data, "licenseNumber")));
        params.put("Phone", SqlParam.ofVarchar(MapUtils.getString(data, "phone")));
        params.put("Email", SqlParam.ofVarchar(MapUtils.getString(data, "email")));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Doctor_Create", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public Map<String, Object> update(int doctorId, Map<String, Object> data) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DoctorID", SqlParam.ofInt(doctorId));
        params.put("DepartmentID", SqlParam.ofInt(MapUtils.getInt(data, "departmentId")));
        params.put("FirstName", SqlParam.ofVarchar(MapUtils.getString(data, "firstName")));
        params.put("LastName", SqlParam.ofVarchar(MapUtils.getString(data, "lastName")));
        params.put("Gender", SqlParam.ofVarchar(MapUtils.getString(data, "gender")));
        params.put("Specialization", SqlParam.ofVarchar(MapUtils.getString(data, "specialization")));
        params.put("LicenseNumber", SqlParam.ofVarchar(MapUtils.getString(data, "licenseNumber")));
        params.put("Phone", SqlParam.ofVarchar(MapUtils.getString(data, "phone")));
        params.put("Email", SqlParam.ofVarchar(MapUtils.getString(data, "email")));
        String status = MapUtils.getString(data, "status");
        params.put("Status", SqlParam.ofVarchar(status == null ? "Active" : status));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Doctor_Update", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public void remove(int doctorId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DoctorID", SqlParam.ofInt(doctorId));
        exec.execute("sp_Doctor_Delete", params);
    }

    public List<Map<String, Object>> getAppointments(int doctorId, String fromDate, String toDate) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DoctorID", SqlParam.ofInt(doctorId));
        params.put("FromDate", fromDate == null ? SqlParam.of(SqlParam.Type.DATE, null) : SqlParam.ofDate(fromDate));
        params.put("ToDate", toDate == null ? SqlParam.of(SqlParam.Type.DATE, null) : SqlParam.ofDate(toDate));
        return exec.executeSingle("sp_Doctor_GetAppointments", params);
    }

    public List<Map<String, Object>> getPatients(int doctorId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DoctorID", SqlParam.ofInt(doctorId));
        return exec.executeSingle("sp_Doctor_GetPatients", params);
    }
}
