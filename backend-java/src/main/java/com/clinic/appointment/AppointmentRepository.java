package com.clinic.appointment;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.clinic.appointment.dto.AppointmentRequest;
import com.clinic.common.PagedResult;
import com.clinic.db.SqlParam;
import com.clinic.db.StoredProcExecutor;

/** Mirrors backend/src/repositories/appointmentRepository.js */
@Repository
public class AppointmentRepository {

    private final StoredProcExecutor exec;

    public AppointmentRepository(StoredProcExecutor exec) {
        this.exec = exec;
    }

    public PagedResult getAll(int pageNumber, int pageSize, Integer doctorId, String status, String fromDate, String toDate) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PageNumber", SqlParam.ofInt(pageNumber));
        params.put("PageSize", SqlParam.ofInt(pageSize));
        params.put("DoctorID", SqlParam.ofInt(doctorId));
        params.put("Status", SqlParam.ofVarchar(status));
        params.put("FromDate", fromDate == null ? SqlParam.of(SqlParam.Type.DATE, null) : SqlParam.ofDate(fromDate));
        params.put("ToDate", toDate == null ? SqlParam.of(SqlParam.Type.DATE, null) : SqlParam.ofDate(toDate));
        return PagedResult.fromRecordset(exec.executeSingle("sp_Appointment_GetAll", params));
    }

    public Map<String, Object> getById(int appointmentId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("AppointmentID", SqlParam.ofInt(appointmentId));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Appointment_GetById", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public Map<String, Object> create(AppointmentRequest data, Integer createdByUserId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PatientID", SqlParam.ofInt(data.getPatientId()));
        params.put("DoctorID", SqlParam.ofInt(data.getDoctorId()));
        params.put("DepartmentID", SqlParam.ofInt(data.getDepartmentId()));
        params.put("AppointmentDate", SqlParam.ofDateTime(data.getAppointmentDate()));
        params.put("DurationMinutes", SqlParam.ofInt(data.getDurationMinutes() == null ? 30 : data.getDurationMinutes()));
        params.put("Reason", SqlParam.ofVarchar(data.getReason()));
        params.put("CreatedByUserID", SqlParam.ofInt(createdByUserId));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Appointment_Create", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public Map<String, Object> update(int appointmentId, AppointmentRequest data) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("AppointmentID", SqlParam.ofInt(appointmentId));
        params.put("AppointmentDate", SqlParam.ofDateTime(data.getAppointmentDate()));
        params.put("DurationMinutes", SqlParam.ofInt(data.getDurationMinutes() == null ? 30 : data.getDurationMinutes()));
        params.put("Reason", SqlParam.ofVarchar(data.getReason()));
        params.put("Notes", SqlParam.ofVarchar(data.getNotes()));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Appointment_Update", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public Map<String, Object> setStatus(int appointmentId, String procName) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("AppointmentID", SqlParam.ofInt(appointmentId));
        List<Map<String, Object>> rs = exec.executeSingle(procName, params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public List<Map<String, Object>> getByPatient(int patientId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PatientID", SqlParam.ofInt(patientId));
        return exec.executeSingle("sp_Appointment_GetByPatient", params);
    }

    public List<Map<String, Object>> getByDoctor(int doctorId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DoctorID", SqlParam.ofInt(doctorId));
        return exec.executeSingle("sp_Appointment_GetByDoctor", params);
    }
}
