package com.clinic.department;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.clinic.common.MapUtils;
import com.clinic.db.SqlParam;
import com.clinic.db.StoredProcExecutor;

/** Mirrors backend/src/repositories/departmentRepository.js */
@Repository
public class DepartmentRepository {

    private final StoredProcExecutor exec;

    public DepartmentRepository(StoredProcExecutor exec) {
        this.exec = exec;
    }

    public List<Map<String, Object>> getAll() throws SQLException {
        return exec.executeSingle("sp_Department_GetAll", new LinkedHashMap<>());
    }

    public Map<String, Object> getById(int departmentId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DepartmentID", SqlParam.ofInt(departmentId));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Department_GetById", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public Map<String, Object> create(Map<String, Object> data) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DepartmentName", SqlParam.ofVarchar(MapUtils.getString(data, "departmentName")));
        params.put("Description", SqlParam.ofVarchar(MapUtils.getString(data, "description")));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Department_Create", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public List<Map<String, Object>> search(String keyword) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("Keyword", SqlParam.ofVarchar(keyword));
        return exec.executeSingle("sp_Department_Search", params);
    }

    public Map<String, Object> update(int departmentId, Map<String, Object> data) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DepartmentID", SqlParam.ofInt(departmentId));
        params.put("DepartmentName", SqlParam.ofVarchar(MapUtils.getString(data, "departmentName")));
        params.put("Description", SqlParam.ofVarchar(MapUtils.getString(data, "description")));
        params.put("IsActive", SqlParam.ofBit(MapUtils.getBoolean(data, "isActive", true)));
        List<Map<String, Object>> rs = exec.executeSingle("sp_Department_Update", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public void remove(int departmentId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("DepartmentID", SqlParam.ofInt(departmentId));
        exec.execute("sp_Department_Delete", params);
    }
}
