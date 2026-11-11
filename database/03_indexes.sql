/* ==================================================================
   03_indexes.sql
   Indexes for frequently searched / joined columns.
   ================================================================== */

USE ClinicPatientHistoryDB;
GO

-- Patients
CREATE INDEX IX_Patients_PatientCode ON Patients(PatientCode);
CREATE INDEX IX_Patients_Phone ON Patients(Phone);
CREATE INDEX IX_Patients_Email ON Patients(Email);
CREATE INDEX IX_Patients_FirstName ON Patients(FirstName);
CREATE INDEX IX_Patients_LastName ON Patients(LastName);
CREATE INDEX IX_Patients_Status ON Patients(Status) WHERE IsDeleted = 0;
GO

-- Doctors
CREATE INDEX IX_Doctors_DoctorCode ON Doctors(DoctorCode);
CREATE INDEX IX_Doctors_DepartmentID ON Doctors(DepartmentID);
CREATE INDEX IX_Doctors_LastName ON Doctors(LastName);
GO

-- Appointments
CREATE INDEX IX_Appointments_AppointmentDate ON Appointments(AppointmentDate);
CREATE INDEX IX_Appointments_PatientID ON Appointments(PatientID);
CREATE INDEX IX_Appointments_DoctorID ON Appointments(DoctorID);
CREATE INDEX IX_Appointments_Status ON Appointments(Status);
CREATE INDEX IX_Appointments_Doctor_Date ON Appointments(DoctorID, AppointmentDate) WHERE IsDeleted = 0;
GO

-- Medical records
CREATE INDEX IX_MedicalHistories_PatientID ON MedicalHistories(PatientID);
CREATE INDEX IX_VitalSigns_PatientID ON VitalSigns(PatientID);
CREATE INDEX IX_Diagnoses_PatientID ON Diagnoses(PatientID);
CREATE INDEX IX_Treatments_PatientID ON Treatments(PatientID);
GO

-- Prescriptions / Medications
CREATE INDEX IX_Prescriptions_PatientID ON Prescriptions(PatientID);
CREATE INDEX IX_PrescriptionItems_PrescriptionID ON PrescriptionItems(PrescriptionID);
CREATE INDEX IX_Medications_StockQuantity ON Medications(StockQuantity);
CREATE INDEX IX_Medications_ExpiryDate ON Medications(ExpiryDate);
GO

-- Laboratory
CREATE INDEX IX_LabRequests_PatientID ON LaboratoryRequests(PatientID);
CREATE INDEX IX_LabRequests_Status ON LaboratoryRequests(Status);
CREATE INDEX IX_LabResults_LabRequestID ON LaboratoryResults(LabRequestID);
GO

-- Billing
CREATE INDEX IX_Invoices_PatientID ON Invoices(PatientID);
CREATE INDEX IX_Invoices_Status ON Invoices(Status);
CREATE INDEX IX_Payments_InvoiceID ON Payments(InvoiceID);
GO

-- Users / Audit
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_AuditLogs_UserID ON AuditLogs(UserID);
CREATE INDEX IX_AuditLogs_Entity ON AuditLogs(Entity, EntityID);
CREATE INDEX IX_Notifications_UserID ON Notifications(UserID, IsRead);
GO
