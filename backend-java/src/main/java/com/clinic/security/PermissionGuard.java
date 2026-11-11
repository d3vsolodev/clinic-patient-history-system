package com.clinic.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.clinic.common.AppException;

/**
 * Mirrors backend/src/middleware/authorize.js. Admins always pass; otherwise
 * the current user must hold at least one of the required permission codes.
 * Called explicitly from controllers, the same way authorize('x.y') is wired
 * per-route in the Express routers.
 */
@Component
public class PermissionGuard {

    public CurrentUser currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication() == null
                ? null
                : SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof CurrentUser user)) {
            throw AppException.unauthorized("Authentication required.");
        }
        return user;
    }

    public CurrentUser require(String... permissions) {
        CurrentUser user = currentUser();
        if (permissions.length == 0) return user;
        if (!user.hasAnyPermission(permissions)) {
            throw AppException.forbidden("You do not have permission to perform this action.");
        }
        return user;
    }
}
