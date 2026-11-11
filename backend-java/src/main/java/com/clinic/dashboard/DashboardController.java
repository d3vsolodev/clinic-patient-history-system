package com.clinic.dashboard;

import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.common.ApiResponse;
import com.clinic.security.PermissionGuard;

/** Mirrors backend/src/controllers/dashboardController.js + backend/src/routes/dashboardRoutes.js */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final PermissionGuard guard;

    public DashboardController(DashboardService dashboardService, PermissionGuard guard) {
        this.dashboardService = dashboardService;
        this.guard = guard;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getDashboard() throws SQLException {
        guard.currentUser();
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", dashboardService.getDashboard()));
    }
}
