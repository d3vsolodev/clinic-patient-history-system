package com.clinic.appointment;

import java.sql.SQLException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.appointment.dto.AppointmentRequest;
import com.clinic.common.ApiResponse;
import com.clinic.common.PagedResult;
import com.clinic.security.PermissionGuard;

import jakarta.validation.Valid;

/** Mirrors backend/src/controllers/appointmentController.js + backend/src/routes/appointmentRoutes.js */
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PermissionGuard guard;

    public AppointmentController(AppointmentService appointmentService, PermissionGuard guard) {
        this.appointmentService = appointmentService;
        this.guard = guard;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> list(@RequestParam(required = false) Integer doctorId,
                                                      @RequestParam(required = false) String status,
                                                      @RequestParam(required = false) String fromDate,
                                                      @RequestParam(required = false) String toDate,
                                                      @RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "20") int pageSize) throws SQLException {
        guard.require("appointments.view");
        PagedResult result = appointmentService.list(page, pageSize, doctorId, status, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", result.getData(),
                Map.of("totalCount", result.getTotalCount(), "page", page, "pageSize", pageSize)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getById(@PathVariable int id) throws SQLException {
        guard.require("appointments.view");
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved", appointmentService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> create(@Valid @RequestBody AppointmentRequest body) throws SQLException {
        var user = guard.require("appointments.manage");
        Object created = appointmentService.create(body, user.userId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Appointment created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> update(@PathVariable int id, @RequestBody AppointmentRequest body) throws SQLException {
        guard.require("appointments.manage");
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", appointmentService.update(id, body)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Object>> cancel(@PathVariable int id) throws SQLException {
        guard.require("appointments.manage");
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", appointmentService.cancel(id)));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<Object>> confirm(@PathVariable int id) throws SQLException {
        guard.require("appointments.manage");
        return ResponseEntity.ok(ApiResponse.success("Appointment confirmed", appointmentService.confirm(id)));
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<Object>> checkIn(@PathVariable int id) throws SQLException {
        guard.require("appointments.manage");
        return ResponseEntity.ok(ApiResponse.success("Patient checked in", appointmentService.checkIn(id)));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Object>> complete(@PathVariable int id) throws SQLException {
        guard.require("appointments.manage");
        return ResponseEntity.ok(ApiResponse.success("Appointment completed", appointmentService.complete(id)));
    }
}
