package com.clinic.common;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Mirrors the withPaging() helper repeated in patientRepository.js / doctorRepository.js / appointmentRepository.js. */
public class PagedResult {

    private final List<Map<String, Object>> data;
    private final long totalCount;

    private PagedResult(List<Map<String, Object>> data, long totalCount) {
        this.data = data;
        this.totalCount = totalCount;
    }

    /** The stored procs return a TotalCount column on every row; strip it and read it once. */
    public static PagedResult fromRecordset(List<Map<String, Object>> recordset) {
        long totalCount = 0;
        List<Map<String, Object>> data = new ArrayList<>();
        if (!recordset.isEmpty()) {
            Object tc = recordset.get(0).get("TotalCount");
            if (tc instanceof Number n) totalCount = n.longValue();
        }
        for (Map<String, Object> row : recordset) {
            Map<String, Object> copy = new java.util.LinkedHashMap<>(row);
            copy.remove("TotalCount");
            data.add(copy);
        }
        return new PagedResult(data, totalCount);
    }

    public List<Map<String, Object>> getData() { return data; }
    public long getTotalCount() { return totalCount; }
}
