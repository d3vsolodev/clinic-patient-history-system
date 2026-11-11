package com.clinic.auth;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.clinic.db.SqlParam;
import com.clinic.db.StoredProcExecutor;

/** Mirrors backend/src/repositories/authRepository.js */
@Repository
public class AuthRepository {

    private final StoredProcExecutor exec;

    public AuthRepository(StoredProcExecutor exec) {
        this.exec = exec;
    }

    public Map<String, Object> getUserByEmail(String email) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("Email", SqlParam.ofVarchar(email));
        List<Map<String, Object>> rs = exec.executeSingle("sp_User_GetByEmail", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public Map<String, Object> getUserById(int userId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("UserID", SqlParam.ofInt(userId));
        List<Map<String, Object>> rs = exec.executeSingle("sp_User_GetById", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    @SuppressWarnings("unchecked")
    public List<String> getUserPermissions(int userId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("UserID", SqlParam.ofInt(userId));
        List<Map<String, Object>> rs = exec.executeSingle("sp_User_GetPermissions", params);
        return rs.stream().map(r -> (String) r.get("PermissionCode")).toList();
    }

    public void updateLastLogin(int userId) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("UserID", SqlParam.ofInt(userId));
        exec.execute("sp_User_UpdateLastLogin", params);
    }

    public void changePassword(int userId, String newPasswordHash) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("UserID", SqlParam.ofInt(userId));
        params.put("NewPasswordHash", SqlParam.ofVarchar(newPasswordHash));
        exec.execute("sp_User_ChangePassword", params);
    }

    public void createRefreshToken(int userId, String tokenHash, LocalDateTime expiresAt, String createdByIp) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("UserID", SqlParam.ofInt(userId));
        params.put("TokenHash", SqlParam.ofVarchar(tokenHash));
        params.put("ExpiresAt", SqlParam.ofDateTime(expiresAt));
        params.put("CreatedByIp", SqlParam.ofVarchar(createdByIp));
        exec.execute("sp_RefreshToken_Create", params);
    }

    public Map<String, Object> getValidRefreshToken(String tokenHash) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("TokenHash", SqlParam.ofVarchar(tokenHash));
        List<Map<String, Object>> rs = exec.executeSingle("sp_RefreshToken_GetValid", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public void revokeRefreshToken(String tokenHash) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("TokenHash", SqlParam.ofVarchar(tokenHash));
        exec.execute("sp_RefreshToken_Revoke", params);
    }

    public List<Map<String, Object>> getAllUsers(int pageNumber, int pageSize) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("PageNumber", SqlParam.ofInt(pageNumber));
        params.put("PageSize", SqlParam.ofInt(pageSize));
        return exec.executeSingle("sp_User_GetAll", params);
    }

    public void setUserActive(int userId, boolean isActive) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("UserID", SqlParam.ofInt(userId));
        params.put("IsActive", SqlParam.ofBit(isActive));
        exec.execute("sp_User_SetActive", params);
    }

    public Map<String, Object> createUser(int roleId, String fullName, String email, String passwordHash, String phone) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("RoleID", SqlParam.ofInt(roleId));
        params.put("FullName", SqlParam.ofVarchar(fullName));
        params.put("Email", SqlParam.ofVarchar(email));
        params.put("PasswordHash", SqlParam.ofVarchar(passwordHash));
        params.put("Phone", SqlParam.ofVarchar(phone));
        List<Map<String, Object>> rs = exec.executeSingle("sp_User_Create", params);
        return rs.isEmpty() ? null : rs.get(0);
    }

    public void createAuditLog(Integer userId, String action, String entity, Integer entityId,
                                String oldValue, String newValue, String ip, String userAgent) throws SQLException {
        var params = new LinkedHashMap<String, SqlParam>();
        params.put("UserID", SqlParam.ofInt(userId));
        params.put("Action", SqlParam.ofVarchar(action));
        params.put("Entity", SqlParam.ofVarchar(entity));
        params.put("EntityID", SqlParam.ofInt(entityId));
        params.put("OldValue", SqlParam.ofVarchar(oldValue));
        params.put("NewValue", SqlParam.ofVarchar(newValue));
        params.put("IPAddress", SqlParam.ofVarchar(ip));
        params.put("UserAgent", SqlParam.ofVarchar(userAgent));
        exec.execute("sp_AuditLog_Create", params);
    }
}
