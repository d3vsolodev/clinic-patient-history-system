package com.clinic.db;

/** Mirrors the { type: sql.X, value } param shape used in backend/src/utils/execProc.js. */
public class SqlParam {

    public enum Type { INT, VARCHAR, DATE, DATETIME, BIT, DECIMAL }

    private final Type type;
    private final Object value;

    private SqlParam(Type type, Object value) {
        this.type = type;
        this.value = value;
    }

    public static SqlParam of(Type type, Object value) { return new SqlParam(type, value); }
    public static SqlParam ofInt(Integer value) { return new SqlParam(Type.INT, value); }
    public static SqlParam ofVarchar(String value) { return new SqlParam(Type.VARCHAR, value); }
    public static SqlParam ofDate(Object value) { return new SqlParam(Type.DATE, value); }
    public static SqlParam ofDateTime(Object value) { return new SqlParam(Type.DATETIME, value); }
    public static SqlParam ofBit(Boolean value) { return new SqlParam(Type.BIT, value); }
    public static SqlParam ofDecimal(Object value) { return new SqlParam(Type.DECIMAL, value); }

    public Type getType() { return type; }
    public Object getValue() { return value; }
}
