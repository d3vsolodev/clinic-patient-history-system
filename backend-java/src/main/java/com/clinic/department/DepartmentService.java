package com.clinic.department;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.clinic.common.AppException;

/** Mirrors backend/src/services/departmentService.js */
@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Map<String, Object>> list() throws SQLException {
        return departmentRepository.getAll();
    }

    public Map<String, Object> getById(int departmentId) throws SQLException {
        Map<String, Object> department = departmentRepository.getById(departmentId);
        if (department == null) throw AppException.notFound("Department not found.");
        return department;
    }

    public Map<String, Object> create(Map<String, Object> data) throws SQLException {
        return departmentRepository.create(data);
    }

    public Map<String, Object> update(int departmentId, Map<String, Object> data) throws SQLException {
        getById(departmentId);
        return departmentRepository.update(departmentId, data);
    }

    public void remove(int departmentId) throws SQLException {
        getById(departmentId);
        departmentRepository.remove(departmentId);
    }
}
