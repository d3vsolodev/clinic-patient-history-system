package com.clinic.patient;

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
import com.clinic.patient.dto.PatientRequest;
import com.clinic.security.PermissionGuard;

import jakarta.validation.Valid;

/** Mirrors backend/src/controllers/patientController.js + backend/src/routes/patientRoutes.js */
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;
    private final PermissionGuard guard;

    public PatientController(PatientService patientService, PermissionGuard guard) {
        this.patientService = patientService;
        this.guard = guard;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> list(@RequestParam(required = false) String search,
                                                      @RequestParam(required = false) String gender,
                                                      @RequestParam(required = false) String status,
                                                      @RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "20") int pageSize) throws SQLException {
        guard.require("patients.view");
        PagedResult result = patientService.list(search, gender, status, page, pageSize);
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved", result.getData(),
                Map.of("totalCount", result.getTotalCount(), "page", page, "pageSize", pageSize)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getById(@PathVariable int id) throws SQLException {
        guard.require("patients.view");
        return ResponseEntity.ok(ApiResponse.success("Patient retrieved", patientService.getById(id)));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<Object>> getProfile(@PathVariable int id) throws SQLException {
        guard.require("patients.view");
        return ResponseEntity.ok(ApiResponse.success("Patient profile retrieved", patientService.getProfile(id)));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<Object>> getTimeline(@PathVariable int id) throws SQLException {
        guard.require("patients.view");
        return ResponseEntity.ok(ApiResponse.success("Patient timeline retrieved", patientService.getTimeline(id)));
    }

    @GetMapping("/{id}/medical-history")
    public ResponseEntity<ApiResponse<Object>> getMedicalHistory(@PathVariable int id) throws SQLException {
        guard.require("patients.view");
        return ResponseEntity.ok(ApiResponse.success("Medical history retrieved", patientService.getMedicalHistory(id)));
    }

    @GetMapping("/{id}/appointments")
    public ResponseEntity<ApiResponse<Object>> getAppointments(@PathVariable int id) throws SQLException {
        guard.require("patients.view");
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", patientService.getAppointments(id)));
    }

    @GetMapping("/{id}/prescriptions")
    public ResponseEntity<ApiResponse<Object>> getPrescriptions(@PathVariable int id) throws SQLException {
        guard.require("patients.view");
        return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved", patientService.getPrescriptions(id)));
    }

    @GetMapping("/{id}/lab-results")
    public ResponseEntity<ApiResponse<Object>> getLabResults(@PathVariable int id) throws SQLException {
        guard.require("patients.view");
        return ResponseEntity.ok(ApiResponse.success("Lab results retrieved", patientService.getLabResults(id)));
    }

    @GetMapping("/{id}/billing")
    public ResponseEntity<ApiResponse<Object>> getBilling(@PathVariable int id) throws SQLException {
        guard.require("patients.view");
        return ResponseEntity.ok(ApiResponse.success("Billing retrieved", patientService.getBilling(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> create(@Valid @RequestBody PatientRequest body) throws SQLException {
        var user = guard.require("patients.create");
        Object created = patientService.create(body, user.userId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> update(@PathVariable int id, @Valid @RequestBody PatientRequest body) throws SQLException {
        var user = guard.require("patients.update");
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", patientService.update(id, body, user.userId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> remove(@PathVariable int id) throws SQLException {
        var user = guard.require("patients.delete");
        patientService.remove(id, user.userId());
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully", null));
    }
}
