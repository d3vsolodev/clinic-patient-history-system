package com.clinic.security;

import java.util.List;

/** Mirrors req.user = { userId, roleId, roleName, permissions } set by middleware/authenticate.js. */
public record CurrentUser(int userId, int roleId, String roleName, List<String> permissions) {

    public boolean isAdmin() {
        return "Admin".equalsIgnoreCase(roleName);
    }

    public boolean hasAnyPermission(String... required) {
        if (isAdmin()) return true;
        for (String p : required) {
            if (permissions.contains(p)) return true;
        }
        return false;
    }
}
