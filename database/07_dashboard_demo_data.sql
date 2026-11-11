/* ==================================================================
   07_dashboard_demo_data.sql
   Adds representative pharmacy, laboratory, and billing data so the
   dashboard financial and workload cards show live values.
   Safe to run more than once.
   ================================================================== */

USE ClinicPatientHistoryDB;
GO

SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;
GO

IF NOT EXISTS (SELECT 1 FROM Prescriptions WHERE Notes = 'Dashboard demo prescription')
BEGIN
    DECLARE @PatientID INT = (SELECT TOP 1 PatientID FROM Patients WHERE IsDeleted = 0 ORDER BY PatientID);
    DECLARE @DoctorID INT = (SELECT TOP 1 DoctorID FROM Doctors WHERE IsDeleted = 0 ORDER BY DoctorID);
    DECLARE @PrescriptionID INT;

    INSERT INTO Prescriptions (PatientID, DoctorID, PrescriptionDate, Notes, Status)
    VALUES (@PatientID, @DoctorID, DATEADD(HOUR, -2, GETDATE()), 'Dashboard demo prescription', 'Active');
    SET @PrescriptionID = SCOPE_IDENTITY();

    INSERT INTO PrescriptionItems (PrescriptionID, MedicationID, Dosage, Frequency, Duration, Route, Quantity, Instructions)
    VALUES (@PrescriptionID, (SELECT TOP 1 MedicationID FROM Medications WHERE Status = 'Active' ORDER BY MedicationID), '500mg', 'Twice daily', '5 days', 'Oral', 10, 'Take after meals');
END
GO

IF NOT EXISTS (SELECT 1 FROM LaboratoryRequests WHERE Priority = 'STAT' AND Status = 'Processing')
BEGIN
    DECLARE @PatientID INT = (SELECT TOP 1 PatientID FROM Patients WHERE IsDeleted = 0 ORDER BY PatientID DESC);
    DECLARE @DoctorID INT = (SELECT TOP 1 DoctorID FROM Doctors WHERE IsDeleted = 0 ORDER BY DoctorID);
    DECLARE @LabTestID INT = (SELECT TOP 1 LabTestID FROM LaboratoryTests WHERE IsActive = 1 ORDER BY LabTestID);

    INSERT INTO LaboratoryRequests (PatientID, DoctorID, LabTestID, RequestDate, Priority, Status)
    VALUES (@PatientID, @DoctorID, @LabTestID, DATEADD(HOUR, -1, GETDATE()), 'STAT', 'Processing');
    INSERT INTO LaboratoryRequests (PatientID, DoctorID, LabTestID, RequestDate, Priority, Status)
    VALUES (@PatientID, @DoctorID, @LabTestID, DATEADD(DAY, -1, GETDATE()), 'Routine', 'Requested');
END
GO

IF NOT EXISTS (SELECT 1 FROM Invoices WHERE InvoiceNumber = 'INV-DASH-0001')
BEGIN
    DECLARE @PatientID INT = (SELECT TOP 1 PatientID FROM Patients WHERE IsDeleted = 0 ORDER BY PatientID);
    DECLARE @InvoiceID INT;

    INSERT INTO Invoices (InvoiceNumber, PatientID, InvoiceDate, DueDate, Subtotal, Total, PaidAmount, Status)
    VALUES ('INV-DASH-0001', @PatientID, GETDATE(), DATEADD(DAY, 14, CAST(GETDATE() AS DATE)), 75.00, 75.00, 25.00, 'Partially Paid');
    SET @InvoiceID = SCOPE_IDENTITY();

    INSERT INTO InvoiceItems (InvoiceID, ServiceID, Description, Quantity, UnitPrice)
    VALUES (@InvoiceID, (SELECT TOP 1 ServiceID FROM Services WHERE Status = 'Active' ORDER BY ServiceID), 'General consultation and lab services', 1, 75.00);

    INSERT INTO Payments (InvoiceID, PatientID, Amount, PaymentMethod, PaymentDate, ReferenceNumber, Notes)
    VALUES (@InvoiceID, @PatientID, 25.00, 'Cash', GETDATE(), 'DASH-DEMO-001', 'Dashboard demo payment');
END
GO

IF NOT EXISTS (SELECT 1 FROM Invoices WHERE InvoiceNumber = 'INV-DASH-0002')
BEGIN
    DECLARE @PatientID INT = (SELECT TOP 1 PatientID FROM Patients WHERE IsDeleted = 0 ORDER BY PatientID DESC);
    DECLARE @InvoiceID INT;

    INSERT INTO Invoices (InvoiceNumber, PatientID, InvoiceDate, DueDate, Subtotal, Total, PaidAmount, Status)
    VALUES ('INV-DASH-0002', @PatientID, DATEADD(DAY, -4, GETDATE()), DATEADD(DAY, 10, CAST(GETDATE() AS DATE)), 120.00, 120.00, 120.00, 'Paid');
    SET @InvoiceID = SCOPE_IDENTITY();

    INSERT INTO InvoiceItems (InvoiceID, ServiceID, Description, Quantity, UnitPrice)
    VALUES (@InvoiceID, (SELECT TOP 1 ServiceID FROM Services WHERE Status = 'Active' ORDER BY ServiceID DESC), 'Specialist consultation', 1, 120.00);

    INSERT INTO Payments (InvoiceID, PatientID, Amount, PaymentMethod, PaymentDate, ReferenceNumber, Notes)
    VALUES (@InvoiceID, @PatientID, 120.00, 'Card', DATEADD(DAY, -4, GETDATE()), 'DASH-DEMO-002', 'Dashboard demo payment');
END
GO

/* Keep Today's Revenue populated when the demo database is opened on a later day. */
IF NOT EXISTS (SELECT 1 FROM Payments WHERE ReferenceNumber = 'DASH-TODAY-001')
BEGIN
    DECLARE @TodayInvoiceID INT = (SELECT InvoiceID FROM Invoices WHERE InvoiceNumber = 'INV-DASH-0001');
    DECLARE @TodayPatientID INT = (SELECT PatientID FROM Invoices WHERE InvoiceID = @TodayInvoiceID);

    INSERT INTO Payments (InvoiceID, PatientID, Amount, PaymentMethod, PaymentDate, ReferenceNumber, Notes)
    VALUES (@TodayInvoiceID, @TodayPatientID, 25.00, 'QR Payment', GETDATE(), 'DASH-TODAY-001', 'Today revenue demo payment');

    UPDATE Invoices
    SET PaidAmount = PaidAmount + 25.00,
        Status = CASE WHEN PaidAmount + 25.00 >= Total THEN 'Paid' ELSE 'Partially Paid' END,
        UpdatedAt = SYSUTCDATETIME()
    WHERE InvoiceID = @TodayInvoiceID;
END
GO