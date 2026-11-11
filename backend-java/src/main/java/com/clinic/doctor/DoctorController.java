package com.clinic.doctor;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.common.ApiResponse;
import com.clinic.common.PagedResult;
import com.clinic.security.PermissionGuard;

/**
 * Mirrors backend/src/controllers/doctorController.js + backend/src/routes/doctorRoutes.js.
 * Note: list/getById/getAppointments/getPatients require only authentication (no specific
 * permission) in the original Express router; only create/update/delete require 'doctors.manage'.
 */
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final PermissionGuard guard;

    public DoctorController(DoctorService doctorService, PermissionGuard guard) {
        this.doctorService = doctorService;
        this.guard = guard;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> list(@RequestParam(required = false) String search,
                                                      @RequestParam(required = false) Integer departmentId,
                                                      @RequestParam(required = false) String status,
                                                      @RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "20") int pageSize) throws SQLException {
        guard.currentUser();
        PagedResult result = doctorService.list(search, departmentId, status, page, pageSize);
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", result.getData(),
                Map.of("totalCount", result.getTotalCount(), "page", page, "pageSize", pageSize)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getById(@PathVariable int id) throws SQLException {
        guard.currentUser();
        return ResponseEntity.ok(ApiResponse.success("Doctor retrieved", doctorService.getById(id)));
    }

    @GetMapping("/{id}/appointments")
    public ResponseEntity<ApiResponse<Object>> getAppointments(@PathVariable int id,
                                                                 @RequestParam(required = false) String fromDate,
                                                                 @RequestParam(required = false) String toDate) throws SQLException {
        guard.currentUser();
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments retrieved", doctorService.getAppointments(id, fromDate, toDate)));
    }

    @GetMapping("/{id}/patients")
    public ResponseEntity<ApiResponse<Object>> getPatients(@PathVariable int id) throws SQLException {
        guard.currentUser();
        return ResponseEntity.ok(ApiResponse.success("Doctor patients retrieved", doctorService.getPatients(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> create(@RequestBody Map<String, Object> body) throws SQLException {
        guard.require("doctors.manage");
        Object created = doctorService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Doctor created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> update(@PathVariable int id, @RequestBody Map<String, Object> body) throws SQLException {
        guard.require("doctors.manage");
        return ResponseEntity.ok(ApiResponse.success("Doctor updated successfully", doctorService.update(id, body)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> remove(@PathVariable int id) throws SQLException {
        guard.require("doctors.manage");
        doctorService.remove(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully", null));
    }
}
