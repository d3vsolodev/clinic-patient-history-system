/* ==================================================================
   04_views.sql
   Reusable read views.
   ================================================================== */

USE ClinicPatientHistoryDB;
GO

CREATE OR ALTER VIEW vw_PatientSummary AS
SELECT
    p.PatientID,
    p.PatientCode,
    p.FirstName,
    p.LastName,
    p.FirstName + ' ' + p.LastName AS FullName,
    p.DateOfBirth,
    DATEDIFF(YEAR, p.DateOfBirth, GETDATE())
        - CASE WHEN DATEADD(YEAR, DATEDIFF(YEAR, p.DateOfBirth, GETDATE()), p.DateOfBirth) > GETDATE()
               THEN 1 ELSE 0 END AS Age,
    p.Gender,
    p.BloodType,
    p.Phone,
    p.Email,
    p.Status,
    p.CreatedAt
FROM Patients p
WHERE p.IsDeleted = 0;
GO

CREATE OR ALTER VIEW vw_AppointmentDetails AS
SELECT
    a.AppointmentID,
    a.PatientID,
    p.FirstName + ' ' + p.LastName AS PatientName,
    p.PatientCode,
    a.DoctorID,
    d.FirstName + ' ' + d.LastName AS DoctorName,
    dep.DepartmentName,
    a.AppointmentDate,
    a.DurationMinutes,
    a.Reason,
    a.Status,
    a.Notes,
    a.CreatedAt
FROM Appointments a
JOIN Patients p ON p.PatientID = a.PatientID
JOIN Doctors d ON d.DoctorID = a.DoctorID
LEFT JOIN Departments dep ON dep.DepartmentID = a.DepartmentID
WHERE a.IsDeleted = 0;
GO

CREATE OR ALTER VIEW vw_PatientMedicalHistory AS
SELECT
    mh.MedicalHistoryID,
    mh.PatientID,
    mh.DoctorID,
    d.FirstName + ' ' + d.LastName AS DoctorName,
    mh.VisitDate,
    mh.ChiefComplaint,
    mh.Symptoms,
    mh.MedicalConditions,
    mh.Allergies,
    mh.CurrentMedications,
    mh.ClinicalNotes,
    mh.FollowUpDate
FROM MedicalHistories mh
JOIN Doctors d ON d.DoctorID = mh.DoctorID
WHERE mh.IsDeleted = 0;
GO

CREATE OR ALTER VIEW vw_PrescriptionDetails AS
SELECT
    pr.PrescriptionID,
    pr.PatientID,
    p.FirstName + ' ' + p.LastName AS PatientName,
    pr.DoctorID,
    d.FirstName + ' ' + d.LastName AS DoctorName,
    pr.PrescriptionDate,
    pr.Status,
    pi.PrescriptionItemID,
    m.MedicineName,
    pi.Dosage,
    pi.Frequency,
    pi.Duration,
    pi.Route,
    pi.Quantity,
    pi.Instructions
FROM Prescriptions pr
JOIN Patients p ON p.PatientID = pr.PatientID
JOIN Doctors d ON d.DoctorID = pr.DoctorID
LEFT JOIN PrescriptionItems pi ON pi.PrescriptionID = pr.PrescriptionID
LEFT JOIN Medications m ON m.MedicationID = pi.MedicationID
WHERE pr.IsDeleted = 0;
GO

CREATE OR ALTER VIEW vw_LaboratoryResults AS
SELECT
    lr.LabResultID,
    req.LabRequestID,
    req.PatientID,
    p.FirstName + ' ' + p.LastName AS PatientName,
    t.TestName,
    lr.ResultValue,
    lr.NormalRange,
    lr.Unit,
    lr.ResultStatus,
    req.Status AS RequestStatus,
    lr.ResultDate
FROM LaboratoryResults lr
JOIN LaboratoryRequests req ON req.LabRequestID = lr.LabRequestID
JOIN Patients p ON p.PatientID = req.PatientID
JOIN LaboratoryTests t ON t.LabTestID = req.LabTestID;
GO

CREATE OR ALTER VIEW vw_InvoiceDetails AS
SELECT
    i.InvoiceID,
    i.InvoiceNumber,
    i.PatientID,
    p.FirstName + ' ' + p.LastName AS PatientName,
    i.InvoiceDate,
    i.DueDate,
    i.Subtotal,
    i.Discount,
    i.Tax,
    i.Total,
    i.PaidAmount,
    i.RemainingBalance,
    i.Status
FROM Invoices i
JOIN Patients p ON p.PatientID = i.PatientID
WHERE i.IsDeleted = 0;
GO
