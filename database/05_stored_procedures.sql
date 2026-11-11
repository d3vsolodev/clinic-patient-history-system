/* ==================================================================
   05_stored_procedures.sql
   Stage 1 scope: Auth, Patients, Doctors, Departments, Appointments,
   Dashboard, Audit Log, Patient Timeline.
   (Medical Records / Pharmacy / Laboratory / Billing procedures are
    added in a later stage following the same pattern.)
   ================================================================== */

USE ClinicPatientHistoryDB;
GO

/* ==================================================================
   AUDIT LOG HELPER
   ================================================================== */
CREATE OR ALTER PROCEDURE sp_AuditLog_Create
    @UserID INT = NULL,
    @Action NVARCHAR(50),
    @Entity NVARCHAR(100),
    @EntityID INT = NULL,
    @OldValue NVARCHAR(MAX) = NULL,
    @NewValue NVARCHAR(MAX) = NULL,
    @IPAddress NVARCHAR(64) = NULL,
    @UserAgent NVARCHAR(300) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO AuditLogs (UserID, Action, Entity, EntityID, OldValue, NewValue, IPAddress, UserAgent)
    VALUES (@UserID, @Action, @Entity, @EntityID, @OldValue, @NewValue, @IPAddress, @UserAgent);
END
GO

/* ==================================================================
   AUTH / USERS
   ================================================================== */

CREATE OR ALTER PROCEDURE sp_User_GetByEmail
    @Email NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.UserID, u.FullName, u.Email, u.PasswordHash, u.Phone, u.AvatarUrl,
           u.IsActive, u.RoleID, r.RoleName, u.CreatedAt, u.LastLoginAt
    FROM Users u
    JOIN Roles r ON r.RoleID = u.RoleID
    WHERE u.Email = @Email AND u.IsDeleted = 0;
END
GO

CREATE OR ALTER PROCEDURE sp_User_GetById
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.UserID, u.FullName, u.Email, u.Phone, u.AvatarUrl,
           u.IsActive, u.RoleID, r.RoleName, u.CreatedAt, u.LastLoginAt
    FROM Users u
    JOIN Roles r ON r.RoleID = u.RoleID
    WHERE u.UserID = @UserID AND u.IsDeleted = 0;
END
GO

CREATE OR ALTER PROCEDURE sp_User_UpdateLastLogin
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users SET LastLoginAt = SYSUTCDATETIME() WHERE UserID = @UserID;
END
GO

CREATE OR ALTER PROCEDURE sp_User_GetPermissions
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.PermissionCode
    FROM Users u
    JOIN RolePermissions rp ON rp.RoleID = u.RoleID
    JOIN Permissions p ON p.PermissionID = rp.PermissionID
    WHERE u.UserID = @UserID;
END
GO

CREATE OR ALTER PROCEDURE sp_RefreshToken_Create
    @UserID INT,
    @TokenHash NVARCHAR(255),
    @ExpiresAt DATETIME2,
    @CreatedByIp NVARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO RefreshTokens (UserID, TokenHash, ExpiresAt, CreatedByIp)
    VALUES (@UserID, @TokenHash, @ExpiresAt, @CreatedByIp);
END
GO

CREATE OR ALTER PROCEDURE sp_RefreshToken_GetValid
    @TokenHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 1 TokenID, UserID, ExpiresAt, RevokedAt
    FROM RefreshTokens
    WHERE TokenHash = @TokenHash
      AND RevokedAt IS NULL
      AND ExpiresAt > SYSUTCDATETIME();
END
GO

CREATE OR ALTER PROCEDURE sp_RefreshToken_Revoke
    @TokenHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE RefreshTokens SET RevokedAt = SYSUTCDATETIME() WHERE TokenHash = @TokenHash;
END
GO

CREATE OR ALTER PROCEDURE sp_User_ChangePassword
    @UserID INT,
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users SET PasswordHash = @NewPasswordHash, UpdatedAt = SYSUTCDATETIME()
    WHERE UserID = @UserID;
END
GO

CREATE OR ALTER PROCEDURE sp_User_SetActive
    @UserID INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users SET IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME()
    WHERE UserID = @UserID;
END
GO

CREATE OR ALTER PROCEDURE sp_User_GetAll
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT u.UserID, u.FullName, u.Email, u.Phone, u.IsActive, u.RoleID, r.RoleName,
           u.LastLoginAt, u.CreatedAt,
           COUNT(*) OVER() AS TotalCount
    FROM Users u
    JOIN Roles r ON r.RoleID = u.RoleID
    WHERE u.IsDeleted = 0
    ORDER BY u.CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_User_Create
    @RoleID INT,
    @FullName NVARCHAR(150),
    @Email NVARCHAR(150),
    @PasswordHash NVARCHAR(255),
    @Phone NVARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email AND IsDeleted = 0)
    BEGIN
        THROW 51000, 'A user with this email already exists.', 1;
    END

    INSERT INTO Users (RoleID, FullName, Email, PasswordHash, Phone)
    VALUES (@RoleID, @FullName, @Email, @PasswordHash, @Phone);

    SELECT SCOPE_IDENTITY() AS UserID;
END
GO

/* ==================================================================
   PATIENTS
   ================================================================== */

CREATE OR ALTER PROCEDURE sp_Patient_GetAll
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT *, COUNT(*) OVER() AS TotalCount
    FROM vw_PatientSummary
    ORDER BY CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_GetById
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_PatientSummary WHERE PatientID = @PatientID;

    SELECT p.EmergencyContactName, p.EmergencyContactPhone, p.Address
    FROM Patients p WHERE p.PatientID = @PatientID AND p.IsDeleted = 0;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_Create
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @DateOfBirth DATE,
    @Gender NVARCHAR(10),
    @BloodType NVARCHAR(5) = NULL,
    @Phone NVARCHAR(30) = NULL,
    @Email NVARCHAR(150) = NULL,
    @Address NVARCHAR(300) = NULL,
    @EmergencyContactName NVARCHAR(150) = NULL,
    @EmergencyContactPhone NVARCHAR(30) = NULL,
    @CreatedByUserID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NewPatientCode NVARCHAR(20);
    DECLARE @NextNum INT;

    SELECT @NextNum = ISNULL(MAX(TRY_CAST(SUBSTRING(PatientCode, 4, 10) AS INT)), 0) + 1
    FROM Patients WHERE PatientCode LIKE 'PT-%';

    SET @NewPatientCode = 'PT-' + RIGHT('000000' + CAST(@NextNum AS VARCHAR(10)), 6);

    INSERT INTO Patients (PatientCode, FirstName, LastName, DateOfBirth, Gender, BloodType,
                           Phone, Email, Address, EmergencyContactName, EmergencyContactPhone)
    VALUES (@NewPatientCode, @FirstName, @LastName, @DateOfBirth, @Gender, @BloodType,
            @Phone, @Email, @Address, @EmergencyContactName, @EmergencyContactPhone);

    DECLARE @NewID INT = SCOPE_IDENTITY();

    EXEC sp_AuditLog_Create @UserID = @CreatedByUserID, @Action = 'Create',
         @Entity = 'Patient', @EntityID = @NewID, @NewValue = @NewPatientCode;

    SELECT * FROM vw_PatientSummary WHERE PatientID = @NewID;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_Update
    @PatientID INT,
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @DateOfBirth DATE,
    @Gender NVARCHAR(10),
    @BloodType NVARCHAR(5) = NULL,
    @Phone NVARCHAR(30) = NULL,
    @Email NVARCHAR(150) = NULL,
    @Address NVARCHAR(300) = NULL,
    @EmergencyContactName NVARCHAR(150) = NULL,
    @EmergencyContactPhone NVARCHAR(30) = NULL,
    @Status NVARCHAR(20) = 'Active',
    @UpdatedByUserID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Patients WHERE PatientID = @PatientID AND IsDeleted = 0)
    BEGIN
        THROW 51001, 'Patient not found.', 1;
    END

    UPDATE Patients
    SET FirstName = @FirstName, LastName = @LastName, DateOfBirth = @DateOfBirth,
        Gender = @Gender, BloodType = @BloodType, Phone = @Phone, Email = @Email,
        Address = @Address, EmergencyContactName = @EmergencyContactName,
        EmergencyContactPhone = @EmergencyContactPhone, Status = @Status,
        UpdatedAt = SYSUTCDATETIME()
    WHERE PatientID = @PatientID;

    EXEC sp_AuditLog_Create @UserID = @UpdatedByUserID, @Action = 'Update',
         @Entity = 'Patient', @EntityID = @PatientID;

    SELECT * FROM vw_PatientSummary WHERE PatientID = @PatientID;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_Delete
    @PatientID INT,
    @DeletedByUserID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Patients SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME() WHERE PatientID = @PatientID;

    EXEC sp_AuditLog_Create @UserID = @DeletedByUserID, @Action = 'Delete',
         @Entity = 'Patient', @EntityID = @PatientID;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_Search
    @SearchTerm NVARCHAR(150) = NULL,
    @Gender NVARCHAR(10) = NULL,
    @Status NVARCHAR(20) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT *, COUNT(*) OVER() AS TotalCount
    FROM vw_PatientSummary
    WHERE (@SearchTerm IS NULL
           OR FullName LIKE '%' + @SearchTerm + '%'
           OR PatientCode LIKE '%' + @SearchTerm + '%'
           OR Phone LIKE '%' + @SearchTerm + '%'
           OR Email LIKE '%' + @SearchTerm + '%')
      AND (@Gender IS NULL OR Gender = @Gender)
      AND (@Status IS NULL OR Status = @Status)
    ORDER BY CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_GetMedicalHistory
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_PatientMedicalHistory WHERE PatientID = @PatientID ORDER BY VisitDate DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_GetAppointments
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_AppointmentDetails WHERE PatientID = @PatientID ORDER BY AppointmentDate DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_GetPrescriptions
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_PrescriptionDetails WHERE PatientID = @PatientID ORDER BY PrescriptionDate DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_GetLabResults
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_LaboratoryResults WHERE PatientID = @PatientID ORDER BY ResultDate DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_GetBilling
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_InvoiceDetails WHERE PatientID = @PatientID ORDER BY InvoiceDate DESC;

    SELECT pay.PaymentID, pay.InvoiceID, pay.Amount, pay.PaymentMethod, pay.PaymentDate, pay.ReferenceNumber
    FROM Payments pay
    WHERE pay.PatientID = @PatientID
    ORDER BY pay.PaymentDate DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_Patient_GetTimeline
    @PatientID INT,
    @Top INT = 100
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Timeline AS (
        SELECT 'Appointment' AS EventType, a.AppointmentID AS EventID, a.AppointmentDate AS EventDate,
               'Appointment - ' + a.Status AS Title, a.Reason AS Description,
               d.FirstName + ' ' + d.LastName AS DoctorName, a.Status
        FROM Appointments a JOIN Doctors d ON d.DoctorID = a.DoctorID
        WHERE a.PatientID = @PatientID AND a.IsDeleted = 0

        UNION ALL
        SELECT 'MedicalHistory', mh.MedicalHistoryID, mh.VisitDate,
               'Visit: ' + ISNULL(mh.ChiefComplaint, 'Consultation'), mh.Symptoms,
               d.FirstName + ' ' + d.LastName, 'Recorded'
        FROM MedicalHistories mh JOIN Doctors d ON d.DoctorID = mh.DoctorID
        WHERE mh.PatientID = @PatientID AND mh.IsDeleted = 0

        UNION ALL
        SELECT 'VitalSigns', v.VitalSignID, v.RecordedAt,
               'Vital Signs Recorded', 'HR ' + ISNULL(CAST(v.HeartRate AS VARCHAR), '-') + ' bpm',
               NULL, 'Recorded'
        FROM VitalSigns v WHERE v.PatientID = @PatientID

        UNION ALL
        SELECT 'Diagnosis', dg.DiagnosisID, dg.DiagnosisDate,
               'Diagnosis: ' + dg.DiagnosisName, dg.Description,
               d.FirstName + ' ' + d.LastName, dg.Severity
        FROM Diagnoses dg JOIN Doctors d ON d.DoctorID = dg.DoctorID
        WHERE dg.PatientID = @PatientID AND dg.IsDeleted = 0

        UNION ALL
        SELECT 'Treatment', t.TreatmentID, CAST(t.StartDate AS DATETIME2),
               'Treatment: ' + t.TreatmentType, t.Description,
               d.FirstName + ' ' + d.LastName, t.Status
        FROM Treatments t JOIN Doctors d ON d.DoctorID = t.DoctorID
        WHERE t.PatientID = @PatientID AND t.IsDeleted = 0

        UNION ALL
        SELECT 'Prescription', pr.PrescriptionID, pr.PrescriptionDate,
               'Prescription Issued', pr.Notes,
               d.FirstName + ' ' + d.LastName, pr.Status
        FROM Prescriptions pr JOIN Doctors d ON d.DoctorID = pr.DoctorID
        WHERE pr.PatientID = @PatientID AND pr.IsDeleted = 0

        UNION ALL
        SELECT 'LabResult', lr.LabResultID, lr.ResultDate,
               'Lab Result: ' + t.TestName, 'Status: ' + lr.ResultStatus,
               NULL, lr.ResultStatus
        FROM LaboratoryResults lr
        JOIN LaboratoryRequests req ON req.LabRequestID = lr.LabRequestID
        JOIN LaboratoryTests t ON t.LabTestID = req.LabTestID
        WHERE req.PatientID = @PatientID

        UNION ALL
        SELECT 'Invoice', i.InvoiceID, i.InvoiceDate,
               'Invoice ' + i.InvoiceNumber, 'Total: ' + CAST(i.Total AS VARCHAR),
               NULL, i.Status
        FROM Invoices i WHERE i.PatientID = @PatientID AND i.IsDeleted = 0

        UNION ALL
        SELECT 'Payment', pay.PaymentID, pay.PaymentDate,
               'Payment Received', 'Amount: ' + CAST(pay.Amount AS VARCHAR),
               NULL, pay.PaymentMethod
        FROM Payments pay WHERE pay.PatientID = @PatientID
    )
    SELECT TOP (@Top) *
    FROM Timeline
    ORDER BY EventDate DESC;
END
GO

/* ==================================================================
   DOCTORS
   ================================================================== */

CREATE OR ALTER PROCEDURE sp_Doctor_GetAll
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT d.DoctorID, d.DoctorCode, d.FirstName, d.LastName,
           d.FirstName + ' ' + d.LastName AS FullName,
           d.Gender, d.Specialization, d.Phone, d.Email, d.Status,
           d.DepartmentID, dep.DepartmentName, d.CreatedAt,
           COUNT(*) OVER() AS TotalCount
    FROM Doctors d
    JOIN Departments dep ON dep.DepartmentID = d.DepartmentID
    WHERE d.IsDeleted = 0
    ORDER BY d.CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_Doctor_GetById
    @DoctorID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT d.*, dep.DepartmentName
    FROM Doctors d
    JOIN Departments dep ON dep.DepartmentID = d.DepartmentID
    WHERE d.DoctorID = @DoctorID AND d.IsDeleted = 0;
END
GO

CREATE OR ALTER PROCEDURE sp_Doctor_Create
    @DepartmentID INT,
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @Gender NVARCHAR(10),
    @Specialization NVARCHAR(150) = NULL,
    @LicenseNumber NVARCHAR(50) = NULL,
    @Phone NVARCHAR(30) = NULL,
    @Email NVARCHAR(150) = NULL,
    @UserID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NextNum INT, @NewCode NVARCHAR(20);
    SELECT @NextNum = ISNULL(MAX(TRY_CAST(SUBSTRING(DoctorCode, 4, 10) AS INT)), 0) + 1
    FROM Doctors WHERE DoctorCode LIKE 'DR-%';
    SET @NewCode = 'DR-' + RIGHT('0000' + CAST(@NextNum AS VARCHAR(10)), 4);

    INSERT INTO Doctors (UserID, DepartmentID, DoctorCode, FirstName, LastName, Gender,
                          Specialization, LicenseNumber, Phone, Email)
    VALUES (@UserID, @DepartmentID, @NewCode, @FirstName, @LastName, @Gender,
            @Specialization, @LicenseNumber, @Phone, @Email);

    SELECT SCOPE_IDENTITY() AS DoctorID;
END
GO

CREATE OR ALTER PROCEDURE sp_Doctor_Update
    @DoctorID INT,
    @DepartmentID INT,
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @Gender NVARCHAR(10),
    @Specialization NVARCHAR(150) = NULL,
    @LicenseNumber NVARCHAR(50) = NULL,
    @Phone NVARCHAR(30) = NULL,
    @Email NVARCHAR(150) = NULL,
    @Status NVARCHAR(20) = 'Active'
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Doctors
    SET DepartmentID = @DepartmentID, FirstName = @FirstName, LastName = @LastName,
        Gender = @Gender, Specialization = @Specialization, LicenseNumber = @LicenseNumber,
        Phone = @Phone, Email = @Email, Status = @Status, UpdatedAt = SYSUTCDATETIME()
    WHERE DoctorID = @DoctorID;

    SELECT * FROM Doctors WHERE DoctorID = @DoctorID;
END
GO

CREATE OR ALTER PROCEDURE sp_Doctor_Delete
    @DoctorID INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Doctors SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME() WHERE DoctorID = @DoctorID;
END
GO

CREATE OR ALTER PROCEDURE sp_Doctor_Search
    @SearchTerm NVARCHAR(150) = NULL,
    @DepartmentID INT = NULL,
    @Status NVARCHAR(20) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT d.DoctorID, d.DoctorCode, d.FirstName, d.LastName,
           d.FirstName + ' ' + d.LastName AS FullName,
           d.Specialization, d.Phone, d.Email, d.Status,
           dep.DepartmentName, COUNT(*) OVER() AS TotalCount
    FROM Doctors d
    JOIN Departments dep ON dep.DepartmentID = d.DepartmentID
    WHERE d.IsDeleted = 0
      AND (@SearchTerm IS NULL OR d.FirstName + ' ' + d.LastName LIKE '%' + @SearchTerm + '%'
           OR d.DoctorCode LIKE '%' + @SearchTerm + '%')
      AND (@DepartmentID IS NULL OR d.DepartmentID = @DepartmentID)
      AND (@Status IS NULL OR d.Status = @Status)
    ORDER BY d.CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_Doctor_GetAppointments
    @DoctorID INT,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_AppointmentDetails
    WHERE DoctorID = @DoctorID
      AND (@FromDate IS NULL OR AppointmentDate >= @FromDate)
      AND (@ToDate IS NULL OR AppointmentDate < DATEADD(DAY, 1, @ToDate))
    ORDER BY AppointmentDate DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_Doctor_GetPatients
    @DoctorID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT p.PatientID, p.PatientCode, p.FirstName + ' ' + p.LastName AS FullName,
           p.Phone, p.Email, MAX(a.AppointmentDate) AS LastVisit
    FROM Appointments a
    JOIN Patients p ON p.PatientID = a.PatientID
    WHERE a.DoctorID = @DoctorID AND a.IsDeleted = 0 AND p.IsDeleted = 0
    GROUP BY p.PatientID, p.PatientCode, p.FirstName, p.LastName, p.Phone, p.Email
    ORDER BY LastVisit DESC;
END
GO

/* ==================================================================
   DEPARTMENTS
   ================================================================== */

CREATE OR ALTER PROCEDURE sp_Department_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT dep.DepartmentID, dep.DepartmentName, dep.Description, dep.IsActive,
           (SELECT COUNT(*) FROM Doctors d WHERE d.DepartmentID = dep.DepartmentID AND d.IsDeleted = 0) AS DoctorCount
    FROM Departments dep
    WHERE dep.IsDeleted = 0
    ORDER BY dep.DepartmentName;
END
GO

CREATE OR ALTER PROCEDURE sp_Department_GetById
    @DepartmentID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Departments WHERE DepartmentID = @DepartmentID AND IsDeleted = 0;
END
GO

CREATE OR ALTER PROCEDURE sp_Department_Create
    @DepartmentName NVARCHAR(150),
    @Description NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Departments (DepartmentName, Description) VALUES (@DepartmentName, @Description);
    SELECT SCOPE_IDENTITY() AS DepartmentID;
END
GO

CREATE OR ALTER PROCEDURE sp_Department_Update
    @DepartmentID INT,
    @DepartmentName NVARCHAR(150),
    @Description NVARCHAR(500) = NULL,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Departments
    SET DepartmentName = @DepartmentName, Description = @Description, IsActive = @IsActive,
        UpdatedAt = SYSUTCDATETIME()
    WHERE DepartmentID = @DepartmentID;

    SELECT * FROM Departments WHERE DepartmentID = @DepartmentID;
END
GO

CREATE OR ALTER PROCEDURE sp_Department_Delete
    @DepartmentID INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Departments SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME() WHERE DepartmentID = @DepartmentID;
END
GO

/* ==================================================================
   APPOINTMENTS
   ================================================================== */

CREATE OR ALTER PROCEDURE sp_Appointment_GetAll
    @PageNumber INT = 1,
    @PageSize INT = 20,
    @DoctorID INT = NULL,
    @Status NVARCHAR(20) = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT *, COUNT(*) OVER() AS TotalCount
    FROM vw_AppointmentDetails
    WHERE (@DoctorID IS NULL OR DoctorID = @DoctorID)
      AND (@Status IS NULL OR Status = @Status)
      AND (@FromDate IS NULL OR AppointmentDate >= @FromDate)
      AND (@ToDate IS NULL OR AppointmentDate < DATEADD(DAY, 1, @ToDate))
    ORDER BY AppointmentDate DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_Appointment_GetById
    @AppointmentID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_AppointmentDetails WHERE AppointmentID = @AppointmentID;
END
GO

CREATE OR ALTER PROCEDURE sp_Appointment_Create
    @PatientID INT,
    @DoctorID INT,
    @DepartmentID INT = NULL,
    @AppointmentDate DATETIME2,
    @DurationMinutes INT = 30,
    @Reason NVARCHAR(500) = NULL,
    @CreatedByUserID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Prevent double-booking: overlapping window check
        IF EXISTS (
            SELECT 1 FROM Appointments
            WHERE DoctorID = @DoctorID
              AND IsDeleted = 0
              AND Status NOT IN ('Cancelled','No Show')
              AND @AppointmentDate < DATEADD(MINUTE, DurationMinutes, AppointmentDate)
              AND DATEADD(MINUTE, @DurationMinutes, @AppointmentDate) > AppointmentDate
        )
        BEGIN
            THROW 51010, 'Doctor already has an appointment in this time slot.', 1;
        END

        INSERT INTO Appointments (PatientID, DoctorID, DepartmentID, AppointmentDate,
                                   DurationMinutes, Reason, Status)
        VALUES (@PatientID, @DoctorID, @DepartmentID, @AppointmentDate,
                @DurationMinutes, @Reason, 'Scheduled');

        DECLARE @NewID INT = SCOPE_IDENTITY();

        EXEC sp_AuditLog_Create @UserID = @CreatedByUserID, @Action = 'Create',
             @Entity = 'Appointment', @EntityID = @NewID;

        INSERT INTO Notifications (Title, Message, NotificationType)
        VALUES ('New Appointment', 'A new appointment was scheduled.', 'Appointment');

        COMMIT TRANSACTION;

        SELECT * FROM vw_AppointmentDetails WHERE AppointmentID = @NewID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_Appointment_Update
    @AppointmentID INT,
    @AppointmentDate DATETIME2,
    @DurationMinutes INT,
    @Reason NVARCHAR(500) = NULL,
    @Notes NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Appointments
    SET AppointmentDate = @AppointmentDate, DurationMinutes = @DurationMinutes,
        Reason = @Reason, Notes = @Notes, UpdatedAt = SYSUTCDATETIME()
    WHERE AppointmentID = @AppointmentID;

    SELECT * FROM vw_AppointmentDetails WHERE AppointmentID = @AppointmentID;
END
GO

CREATE OR ALTER PROCEDURE sp_Appointment_SetStatus
    @AppointmentID INT,
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Appointments SET Status = @Status, UpdatedAt = SYSUTCDATETIME()
    WHERE AppointmentID = @AppointmentID;

    SELECT * FROM vw_AppointmentDetails WHERE AppointmentID = @AppointmentID;
END
GO

CREATE OR ALTER PROCEDURE sp_Appointment_Cancel  @AppointmentID INT AS
BEGIN SET NOCOUNT ON; EXEC sp_Appointment_SetStatus @AppointmentID, 'Cancelled'; END
GO
CREATE OR ALTER PROCEDURE sp_Appointment_Confirm @AppointmentID INT AS
BEGIN SET NOCOUNT ON; EXEC sp_Appointment_SetStatus @AppointmentID, 'Confirmed'; END
GO
CREATE OR ALTER PROCEDURE sp_Appointment_CheckIn @AppointmentID INT AS
BEGIN SET NOCOUNT ON; EXEC sp_Appointment_SetStatus @AppointmentID, 'Checked In'; END
GO
CREATE OR ALTER PROCEDURE sp_Appointment_Complete @AppointmentID INT AS
BEGIN SET NOCOUNT ON; EXEC sp_Appointment_SetStatus @AppointmentID, 'Completed'; END
GO

CREATE OR ALTER PROCEDURE sp_Appointment_GetByPatient
    @PatientID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_AppointmentDetails WHERE PatientID = @PatientID ORDER BY AppointmentDate DESC;
END
GO

CREATE OR ALTER PROCEDURE sp_Appointment_GetByDoctor
    @DoctorID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_AppointmentDetails WHERE DoctorID = @DoctorID ORDER BY AppointmentDate DESC;
END
GO

/* ==================================================================
   DASHBOARD
   ================================================================== */

CREATE OR ALTER PROCEDURE sp_Dashboard_GetSummary
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM Patients WHERE IsDeleted = 0) AS TotalPatients,
        (SELECT COUNT(*) FROM Patients WHERE IsDeleted = 0 AND CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)) AS NewPatientsToday,
        (SELECT COUNT(*) FROM Appointments WHERE IsDeleted = 0 AND CAST(AppointmentDate AS DATE) = CAST(GETDATE() AS DATE)) AS TodayAppointments,
        (SELECT COUNT(*) FROM Appointments WHERE IsDeleted = 0 AND Status = 'Completed' AND CAST(AppointmentDate AS DATE) = CAST(GETDATE() AS DATE)) AS CompletedAppointmentsToday,
        (SELECT COUNT(*) FROM Doctors WHERE IsDeleted = 0 AND Status = 'Active') AS TotalDoctors,
        (SELECT COUNT(*) FROM LaboratoryRequests WHERE Status IN ('Requested','Collected','Processing')) AS PendingLabTests,
        (SELECT COUNT(*) FROM Prescriptions WHERE IsDeleted = 0 AND Status = 'Active') AS PendingPrescriptions,
        (SELECT ISNULL(SUM(pay.Amount), 0) FROM Payments pay WHERE CAST(pay.PaymentDate AS DATE) = CAST(GETDATE() AS DATE)) AS TodayRevenue,
        (SELECT ISNULL(SUM(pay.Amount), 0) FROM Payments pay WHERE MONTH(pay.PaymentDate) = MONTH(GETDATE()) AND YEAR(pay.PaymentDate) = YEAR(GETDATE())) AS MonthlyRevenue,
        (SELECT ISNULL(SUM(RemainingBalance), 0) FROM Invoices WHERE IsDeleted = 0 AND Status NOT IN ('Paid','Cancelled')) AS OutstandingBalance;
END
GO

CREATE OR ALTER PROCEDURE sp_Dashboard_GetPatientRegistrationTrend
    @Months INT = 6
AS
BEGIN
    SET NOCOUNT ON;
    SELECT FORMAT(CreatedAt, 'yyyy-MM') AS Period, COUNT(*) AS Count
    FROM Patients
    WHERE IsDeleted = 0 AND CreatedAt >= DATEADD(MONTH, -@Months, GETDATE())
    GROUP BY FORMAT(CreatedAt, 'yyyy-MM')
    ORDER BY Period;
END
GO

CREATE OR ALTER PROCEDURE sp_Dashboard_GetAppointmentTrend
    @Days INT = 7
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CAST(AppointmentDate AS DATE) AS Day, COUNT(*) AS Count
    FROM Appointments
    WHERE IsDeleted = 0 AND AppointmentDate >= DATEADD(DAY, -@Days, GETDATE())
    GROUP BY CAST(AppointmentDate AS DATE)
    ORDER BY Day;
END
GO

CREATE OR ALTER PROCEDURE sp_Dashboard_GetRevenueTrend
    @Months INT = 6
AS
BEGIN
    SET NOCOUNT ON;
    SELECT FORMAT(PaymentDate, 'yyyy-MM') AS Period, SUM(Amount) AS Revenue
    FROM Payments
    WHERE PaymentDate >= DATEADD(MONTH, -@Months, GETDATE())
    GROUP BY FORMAT(PaymentDate, 'yyyy-MM')
    ORDER BY Period;
END
GO

CREATE OR ALTER PROCEDURE sp_Dashboard_GetGenderDistribution
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Gender, COUNT(*) AS Count
    FROM Patients WHERE IsDeleted = 0
    GROUP BY Gender;
END
GO

CREATE OR ALTER PROCEDURE sp_Dashboard_GetCommonDiagnoses
    @Top INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Top) DiagnosisName, COUNT(*) AS Count
    FROM Diagnoses
    WHERE IsDeleted = 0
    GROUP BY DiagnosisName
    ORDER BY Count DESC;
END
GO
