package com.clinic.department;

import java.sql.SQLException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.common.ApiResponse;
import com.clinic.security.PermissionGuard;

/** Mirrors backend/src/controllers/departmentController.js + backend/src/routes/departmentRoutes.js */
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;
    private final PermissionGuard guard;

    public DepartmentController(DepartmentService departmentService, PermissionGuard guard) {
        this.departmentService = departmentService;
        this.guard = guard;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> list() throws SQLException {
        guard.currentUser();
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", departmentService.list()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getById(@PathVariable int id) throws SQLException {
        guard.currentUser();
        return ResponseEntity.ok(ApiResponse.success("Department retrieved", departmentService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> create(@RequestBody Map<String, Object> body) throws SQLException {
        guard.require("departments.manage");
        Object created = departmentService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Department created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> update(@PathVariable int id, @RequestBody Map<String, Object> body) throws SQLException {
        guard.require("departments.manage");
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully", departmentService.update(id, body)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> remove(@PathVariable int id) throws SQLException {
        guard.require("departments.manage");
        departmentService.remove(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted successfully", null));
    }
}
