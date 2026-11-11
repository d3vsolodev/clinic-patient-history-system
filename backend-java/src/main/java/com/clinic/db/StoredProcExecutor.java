package com.clinic.db;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import javax.sql.DataSource;

import org.springframework.stereotype.Component;

/**
 * Executes PostgreSQL functions that expose each result set as a refcursor.
 * The repository-facing recordset contract remains unchanged.
 */
@Component
public class StoredProcExecutor {

    private static final Pattern FUNCTION_NAME = Pattern.compile("sp_[A-Za-z0-9_]+");
    private static final Map<String, String> CONTRACT_COLUMN_NAMES = contractColumnNames();

    private final DataSource dataSource;

    public StoredProcExecutor(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<List<Map<String, Object>>> execute(String functionName) throws SQLException {
        return execute(functionName, new LinkedHashMap<>());
    }

    /**
     * PostgreSQL has no SQL Server-style EXEC recordsets. Functions use
     * {@code RETURNS SETOF refcursor}; all cursors are fetched within the same
     * transaction and preserve their order as separate result sets.
     */
    public List<List<Map<String, Object>>> execute(
            String functionName, LinkedHashMap<String, SqlParam> params) throws SQLException {
        if (!FUNCTION_NAME.matcher(functionName).matches()) {
            throw new SQLException("Unsupported database function name");
        }
        String sql = buildCallSql(functionName, params.size());

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                List<String> cursors = new ArrayList<>();
                try (PreparedStatement statement = conn.prepareStatement(sql)) {
                    int index = 1;
                    for (SqlParam param : params.values()) {
                        bindParam(statement, index++, param);
                    }
                    try (ResultSet rs = statement.executeQuery()) {
                        while (rs.next()) {
                            cursors.add(rs.getString(1));
                        }
                    }
                }

                List<List<Map<String, Object>>> recordsets = new ArrayList<>();
                for (String cursor : cursors) {
                    // Cursor names are server-generated identifiers; quote and
                    // escape them rather than interpolating untrusted input.
                    String quotedCursor = "\"" + cursor.replace("\"", "\"\"") + "\"";
                    try (PreparedStatement fetch = conn.prepareStatement("FETCH ALL FROM " + quotedCursor);
                         ResultSet rs = fetch.executeQuery()) {
                        recordsets.add(mapResultSet(rs));
                    }
                }
                conn.commit();
                return recordsets;
            } catch (SQLException | RuntimeException exception) {
                conn.rollback();
                throw exception;
            }
        }
    }

    public List<Map<String, Object>> executeSingle(
            String functionName, LinkedHashMap<String, SqlParam> params) throws SQLException {
        List<List<Map<String, Object>>> all = execute(functionName, params);
        return all.isEmpty() ? List.of() : all.get(0);
    }

    private String buildCallSql(String functionName, int parameterCount) {
        StringBuilder sql = new StringBuilder("SELECT * FROM public.\"")
                .append(functionName).append("\"(");
        for (int i = 0; i < parameterCount; i++) {
            if (i > 0) sql.append(", ");
            sql.append('?');
        }
        return sql.append(')').toString();
    }

    private void bindParam(PreparedStatement statement, int index, SqlParam param) throws SQLException {
        Object value = param.getValue();
        if (value == null) {
            statement.setNull(index, sqlTypeFor(param.getType()));
            return;
        }
        switch (param.getType()) {
            case INT -> statement.setInt(index, ((Number) value).intValue());
            case VARCHAR -> statement.setString(index, value.toString());
            case BIT -> statement.setBoolean(index, (Boolean) value);
            case DECIMAL -> statement.setBigDecimal(index, new java.math.BigDecimal(value.toString()));
            case DATE -> statement.setDate(index, toSqlDate(value));
            case DATETIME -> statement.setTimestamp(index, toSqlTimestamp(value));
        }
    }

    private int sqlTypeFor(SqlParam.Type type) {
        return switch (type) {
            case INT -> Types.INTEGER;
            case VARCHAR -> Types.VARCHAR;
            case BIT -> Types.BOOLEAN;
            case DECIMAL -> Types.DECIMAL;
            case DATE -> Types.DATE;
            case DATETIME -> Types.TIMESTAMP;
        };
    }

    private Date toSqlDate(Object value) {
        if (value instanceof Date date) return date;
        if (value instanceof LocalDate date) return Date.valueOf(date);
        return Date.valueOf(LocalDate.parse(value.toString().substring(0, 10)));
    }

    private Timestamp toSqlTimestamp(Object value) {
        if (value instanceof Timestamp timestamp) return timestamp;
        if (value instanceof LocalDateTime dateTime) return Timestamp.valueOf(dateTime);
        String text = value.toString();
        try {
            return Timestamp.valueOf(LocalDateTime.parse(text.replace("Z", "")));
        } catch (RuntimeException exception) {
            return Timestamp.valueOf(LocalDate.parse(text.substring(0, 10)).atStartOfDay());
        }
    }

    private List<Map<String, Object>> mapResultSet(ResultSet rs) throws SQLException {
        ResultSetMetaData meta = rs.getMetaData();
        int columnCount = meta.getColumnCount();
        List<Map<String, Object>> rows = new ArrayList<>();
        while (rs.next()) {
            Map<String, Object> row = new LinkedHashMap<>();
            for (int i = 1; i <= columnCount; i++) {
                String label = meta.getColumnLabel(i);
                Object value = rs.getObject(i);
                if (value instanceof Timestamp timestamp) {
                    value = timestamp.toLocalDateTime();
                } else if (value instanceof Date date) {
                    value = date.toLocalDate();
                }
                row.put(CONTRACT_COLUMN_NAMES.getOrDefault(label.toLowerCase(), label), value);
            }
            rows.add(row);
        }
        return rows;
    }

    private static Map<String, String> contractColumnNames() {
        Map<String, String> names = new LinkedHashMap<>();
        String[] columns = {
            "UserID", "RoleID", "RoleName", "PermissionID", "PermissionCode", "TokenID",
            "PatientID", "PatientCode", "FirstName", "LastName", "FullName", "DateOfBirth",
            "Age", "Gender", "BloodType", "Phone", "Email", "Address", "EmergencyContactName",
            "EmergencyContactPhone", "Status", "CreatedAt", "UpdatedAt", "LastLoginAt",
            "PasswordHash", "AvatarUrl", "IsActive", "IsDeleted", "ExpiresAt", "RevokedAt",
            "TotalCount", "DoctorID", "DoctorCode", "DepartmentID", "DepartmentName",
            "Specialization", "LicenseNumber", "DoctorName", "DoctorCount", "AppointmentID",
            "AppointmentDate", "DurationMinutes", "PatientName", "Reason", "Notes",
            "MedicalHistoryID", "VisitDate", "ChiefComplaint", "Symptoms", "MedicalConditions",
            "Allergies", "CurrentMedications", "ClinicalNotes", "FollowUpDate", "PrescriptionID",
            "PrescriptionDate", "PrescriptionItemID", "MedicineName", "Dosage", "Frequency",
            "Duration", "Route", "Quantity", "Instructions", "LabResultID", "LabRequestID",
            "TestName", "ResultValue", "NormalRange", "Unit", "ResultStatus", "RequestStatus",
            "ResultDate", "InvoiceID", "InvoiceNumber", "InvoiceDate", "DueDate", "Subtotal",
            "Discount", "Tax", "Total", "PaidAmount", "RemainingBalance", "PaymentID", "Amount",
            "PaymentMethod", "PaymentDate", "ReferenceNumber", "EventType", "EventID",
            "EventDate", "Title", "Description", "CreatedByUserID", "UpdatedByUserID",
            "DeletedByUserID", "SearchTerm", "PageNumber", "PageSize", "Count", "Day",
            "Period", "Revenue", "TotalPatients", "NewPatientsToday", "TodayAppointments",
            "CompletedAppointmentsToday", "TotalDoctors", "PendingLabTests", "PendingPrescriptions",
            "TodayRevenue", "MonthlyRevenue", "OutstandingBalance", "DiagnosisName", "Severity",
            "BloodPressureSystolic", "BloodPressureDiastolic", "HeartRate", "RespiratoryRate",
            "OxygenSaturation", "WeightKg", "HeightCm", "BMI", "Temperature", "TreatmentType",
            "StartDate", "EndDate", "MedicationID", "StockQuantity", "ExpiryDate", "LabTestID",
            "ServiceID", "IsRead", "EntityID", "OldValue", "NewValue", "IPAddress", "UserAgent",
            "CreatedByIp", "Action", "Entity"
        };
        for (String column : columns) names.put(column.toLowerCase(), column);
        return Map.copyOf(names);
    }
}
