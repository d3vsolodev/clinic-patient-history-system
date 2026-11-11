package com.clinic.patient;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.clinic.common.PagedResult;
import com.clinic.db.SqlParam;
import com.clinic.db.StoredProcExecutor;

/** Mirrors backend/src/repositories/patientRepository.js */
@Repository
public class PatientRepository {

    private final StoredProcExecutor exec;

    public PatientRepository(StoredProcExecutor exec) {
        this.exec = exec;
    }

    public PagedResult getAll(int pageNumber, int pageSize) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PageNumber", SqlParam.ofInt(pageNumber));
        params.put("PageSize", SqlParam.ofInt(pageSize));
        return PagedResult.fromRecordset(exec.executeSingle("sp_Patient_GetAll", params));
    }

    public PagedResult search(String searchTerm, String gender, String status, int pageNumber, int pageSize) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("SearchTerm", SqlParam.ofVarchar(searchTerm));
        params.put("Gender", SqlParam.ofVarchar(gender));
        params.put("Status", SqlParam.ofVarchar(status));
        params.put("PageNumber", SqlParam.ofInt(pageNumber));
        params.put("PageSize", SqlParam.ofInt(pageSize));
        return PagedResult.fromRecordset(exec.executeSingle("sp_Patient_Search", params));
    }

    public Map<String, Object> getById(int patientId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PatientID", SqlParam.ofInt(patientId));
        List<List<Map<String, Object>>> recordsets = exec.execute("sp_Patient_GetById", params);
        Map<String, Object> summary = firstRow(recordsets, 0);
        Map<String, Object> extra = firstRow(recordsets, 1);
        if (summary == null) return null;
        Map<String, Object> merged = new LinkedHashMap<>(summary);
        if (extra != null) merged.putAll(extra);
        return merged;
    }

    public Map<String, Object> create(com.clinic.patient.dto.PatientRequest data, Integer createdByUserId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("FirstName", SqlParam.ofVarchar(data.getFirstName()));
        params.put("LastName", SqlParam.ofVarchar(data.getLastName()));
        params.put("DateOfBirth", SqlParam.ofDate(data.getDateOfBirth()));
        params.put("Gender", SqlParam.ofVarchar(data.getGender()));
        params.put("BloodType", SqlParam.ofVarchar(data.getBloodType()));
        params.put("Phone", SqlParam.ofVarchar(data.getPhone()));
        params.put("Email", SqlParam.ofVarchar(data.getEmail()));
        params.put("Address", SqlParam.ofVarchar(data.getAddress()));
        params.put("EmergencyContactName", SqlParam.ofVarchar(data.getEmergencyContactName()));
        params.put("EmergencyContactPhone", SqlParam.ofVarchar(data.getEmergencyContactPhone()));
        params.put("CreatedByUserID", SqlParam.ofInt(createdByUserId));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Patient_Create", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public Map<String, Object> update(int patientId, com.clinic.patient.dto.PatientRequest data, Integer updatedByUserId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PatientID", SqlParam.ofInt(patientId));
        params.put("FirstName", SqlParam.ofVarchar(data.getFirstName()));
        params.put("LastName", SqlParam.ofVarchar(data.getLastName()));
        params.put("DateOfBirth", SqlParam.ofDate(data.getDateOfBirth()));
        params.put("Gender", SqlParam.ofVarchar(data.getGender()));
        params.put("BloodType", SqlParam.ofVarchar(data.getBloodType()));
        params.put("Phone", SqlParam.ofVarchar(data.getPhone()));
        params.put("Email", SqlParam.ofVarchar(data.getEmail()));
        params.put("Address", SqlParam.ofVarchar(data.getAddress()));
        params.put("EmergencyContactName", SqlParam.ofVarchar(data.getEmergencyContactName()));
        params.put("EmergencyContactPhone", SqlParam.ofVarchar(data.getEmergencyContactPhone()));
        params.put("Status", SqlParam.ofVarchar(data.getStatus() == null ? "Active" : data.getStatus()));
        params.put("UpdatedByUserID", SqlParam.ofInt(updatedByUserId));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Patient_Update", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public void remove(int patientId, Integer deletedByUserId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PatientID", SqlParam.ofInt(patientId));
        params.put("DeletedByUserID", SqlParam.ofInt(deletedByUserId));
        exec.execute("sp_Patient_Delete", params);
    }

    public List<Map<String, Object>> getMedicalHistory(int patientId) throws SQLException {
        return execByPatientId("sp_Patient_GetMedicalHistory", patientId);
    }

    public List<Map<String, Object>> getAppointments(int patientId) throws SQLException {
        return execByPatientId("sp_Patient_GetAppointments", patientId);
    }

    public List<Map<String, Object>> getPrescriptions(int patientId) throws SQLException {
        return execByPatientId("sp_Patient_GetPrescriptions", patientId);
    }

    public List<Map<String, Object>> getLabResults(int patientId) throws SQLException {
        return execByPatientId("sp_Patient_GetLabResults", patientId);
    }

    public Map<String, Object> getBilling(int patientId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PatientID", SqlParam.ofInt(patientId));
        List<List<Map<String, Object>>> recordsets = exec.execute("sp_Patient_GetBilling", params);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("invoices", recordsets.size() > 0 ? recordsets.get(0) : List.of());
        result.put("payments", recordsets.size() > 1 ? recordsets.get(1) : List.of());
        return result;
    }

    public List<Map<String, Object>> getTimeline(int patientId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PatientID", SqlParam.ofInt(patientId));
        params.put("Top", SqlParam.ofInt(200));
        return exec.executeSingle("sp_Patient_GetTimeline", params);
    }

    private List<Map<String, Object>> execByPatientId(String procName, int patientId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PatientID", SqlParam.ofInt(patientId));
        return exec.executeSingle(procName, params);
    }

    private Map<String, Object> firstRow(List<List<Map<String, Object>>> recordsets, int index) {
        if (recordsets.size() <= index || recordsets.get(index).isEmpty()) return null;
        return recordsets.get(index).get(0);
    }
}
