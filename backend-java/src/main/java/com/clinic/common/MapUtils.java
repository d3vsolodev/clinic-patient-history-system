package com.clinic.common;

import java.util.Map;

/** Safe accessors for the loosely-typed Map<String,Object> request bodies used by
 *  the doctor/department modules (which had no validators in the original Node backend). */
public final class MapUtils {

    private MapUtils() {}

    public static Integer getInt(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null) return null;
        if (v instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(v.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static String getString(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v == null ? null : v.toString();
    }

    public static Boolean getBoolean(Map<String, Object> map, String key, boolean defaultValue) {
        Object v = map.get(key);
        if (v == null) return defaultValue;
        if (v instanceof Boolean b) return b;
        return Boolean.parseBoolean(v.toString());
    }
}
