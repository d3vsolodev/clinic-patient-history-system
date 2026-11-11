/* ==================================================================
   02_tables.sql
   Full schema for ClinicPatientHistoryDB.
   Run after 01_create_database.sql.
   ================================================================== */

USE ClinicPatientHistoryDB;
GO

/* ==================================================================
   SECURITY / IDENTITY
   ================================================================== */

CREATE TABLE Roles (
    RoleID          INT IDENTITY(1,1) PRIMARY KEY,
    RoleName        NVARCHAR(50) NOT NULL UNIQUE,
    Description     NVARCHAR(255) NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE Permissions (
    PermissionID    INT IDENTITY(1,1) PRIMARY KEY,
    PermissionCode  NVARCHAR(100) NOT NULL UNIQUE, -- e.g. 'patients.create'
    Description     NVARCHAR(255) NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE RolePermissions (
    RolePermissionID INT IDENTITY(1,1) PRIMARY KEY,
    RoleID           INT NOT NULL FOREIGN KEY REFERENCES Roles(RoleID),
    PermissionID     INT NOT NULL FOREIGN KEY REFERENCES Permissions(PermissionID),
    CONSTRAINT UQ_RolePermission UNIQUE (RoleID, PermissionID)
);
GO

CREATE TABLE Users (
    UserID          INT IDENTITY(1,1) PRIMARY KEY,
    RoleID          INT NOT NULL FOREIGN KEY REFERENCES Roles(RoleID),
    FullName        NVARCHAR(150) NOT NULL,
    Email           NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(255) NOT NULL,
    Phone           NVARCHAR(30) NULL,
    AvatarUrl       NVARCHAR(500) NULL,
    IsActive        BIT NOT NULL DEFAULT 1,
    LastLoginAt     DATETIME2 NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted       BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE RefreshTokens (
    TokenID         INT IDENTITY(1,1) PRIMARY KEY,
    UserID          INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    TokenHash       NVARCHAR(255) NOT NULL,
    ExpiresAt       DATETIME2 NOT NULL,
    RevokedAt       DATETIME2 NULL,
    CreatedByIp     NVARCHAR(64) NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ==================================================================
   CORE CLINIC ENTITIES
   ================================================================== */

CREATE TABLE Departments (
    DepartmentID    INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentName  NVARCHAR(150) NOT NULL UNIQUE,
    Description     NVARCHAR(500) NULL,
    IsActive        BIT NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted       BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE Doctors (
    DoctorID        INT IDENTITY(1,1) PRIMARY KEY,
    UserID          INT NULL FOREIGN KEY REFERENCES Users(UserID),
    DepartmentID    INT NOT NULL FOREIGN KEY REFERENCES Departments(DepartmentID),
    DoctorCode      NVARCHAR(20) NOT NULL UNIQUE,
    FirstName       NVARCHAR(100) NOT NULL,
    LastName        NVARCHAR(100) NOT NULL,
    Gender          NVARCHAR(10) NOT NULL CHECK (Gender IN ('Male','Female','Other')),
    Specialization  NVARCHAR(150) NULL,
    LicenseNumber   NVARCHAR(50) NULL,
    Phone           NVARCHAR(30) NULL,
    Email           NVARCHAR(150) NULL,
    Status          NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active','On Leave','Inactive')),
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted       BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE Patients (
    PatientID       INT IDENTITY(1,1) PRIMARY KEY,
    PatientCode     NVARCHAR(20) NOT NULL UNIQUE,
    FirstName       NVARCHAR(100) NOT NULL,
    LastName        NVARCHAR(100) NOT NULL,
    DateOfBirth     DATE NOT NULL,
    Gender          NVARCHAR(10) NOT NULL CHECK (Gender IN ('Male','Female','Other')),
    BloodType       NVARCHAR(5) NULL CHECK (BloodType IN ('A+','A-','B+','B-','AB+','AB-','O+','O-') OR BloodType IS NULL),
    Phone           NVARCHAR(30) NULL,
    Email           NVARCHAR(150) NULL,
    Address         NVARCHAR(300) NULL,
    EmergencyContactName  NVARCHAR(150) NULL,
    EmergencyContactPhone NVARCHAR(30) NULL,
    Status          NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active','Inactive')),
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted       BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE Appointments (
    AppointmentID   INT IDENTITY(1,1) PRIMARY KEY,
    PatientID       INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    DoctorID        INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
    DepartmentID    INT NULL FOREIGN KEY REFERENCES Departments(DepartmentID),
    AppointmentDate DATETIME2 NOT NULL,
    DurationMinutes INT NOT NULL DEFAULT 30,
    Reason          NVARCHAR(500) NULL,
    Status          NVARCHAR(20) NOT NULL DEFAULT 'Scheduled'
                    CHECK (Status IN ('Scheduled','Confirmed','Checked In','In Progress','Completed','Cancelled','No Show')),
    Notes           NVARCHAR(1000) NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted       BIT NOT NULL DEFAULT 0
);
GO

/* ==================================================================
   MEDICAL RECORDS
   ================================================================== */

CREATE TABLE MedicalHistories (
    MedicalHistoryID INT IDENTITY(1,1) PRIMARY KEY,
    PatientID        INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    DoctorID         INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
    AppointmentID    INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID),
    VisitDate        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ChiefComplaint   NVARCHAR(500) NULL,
    Symptoms         NVARCHAR(1000) NULL,
    MedicalConditions NVARCHAR(1000) NULL,
    PastSurgeries    NVARCHAR(1000) NULL,
    FamilyHistory    NVARCHAR(1000) NULL,
    SocialHistory    NVARCHAR(1000) NULL,
    Allergies        NVARCHAR(500) NULL,
    CurrentMedications NVARCHAR(1000) NULL,
    ClinicalNotes    NVARCHAR(MAX) NULL,
    FollowUpDate     DATE NULL,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted        BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE VitalSigns (
    VitalSignID      INT IDENTITY(1,1) PRIMARY KEY,
    PatientID        INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    AppointmentID    INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID),
    RecordedByUserID INT NULL FOREIGN KEY REFERENCES Users(UserID),
    Temperature      DECIMAL(4,1) NULL,      -- Celsius
    BloodPressureSystolic  INT NULL,
    BloodPressureDiastolic INT NULL,
    HeartRate        INT NULL,               -- bpm
    RespiratoryRate  INT NULL,                -- breaths/min
    OxygenSaturation DECIMAL(4,1) NULL,       -- %
    WeightKg         DECIMAL(5,2) NULL,
    HeightCm         DECIMAL(5,2) NULL,
    BMI              AS (CASE WHEN HeightCm IS NOT NULL AND HeightCm > 0 AND WeightKg IS NOT NULL
                              THEN ROUND(WeightKg / POWER(HeightCm/100.0, 2), 1)
                              ELSE NULL END) PERSISTED,
    RecordedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE Diagnoses (
    DiagnosisID      INT IDENTITY(1,1) PRIMARY KEY,
    PatientID        INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    DoctorID         INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
    AppointmentID    INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID),
    DiagnosisCode    NVARCHAR(20) NULL,       -- e.g. ICD-10
    DiagnosisName    NVARCHAR(255) NOT NULL,
    Description      NVARCHAR(1000) NULL,
    Severity         NVARCHAR(20) NOT NULL DEFAULT 'Moderate' CHECK (Severity IN ('Mild','Moderate','Severe','Critical')),
    DiagnosisDate    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Notes            NVARCHAR(1000) NULL,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted        BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE Treatments (
    TreatmentID      INT IDENTITY(1,1) PRIMARY KEY,
    PatientID        INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    DoctorID         INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
    DiagnosisID      INT NULL FOREIGN KEY REFERENCES Diagnoses(DiagnosisID),
    TreatmentType    NVARCHAR(150) NOT NULL,
    Description      NVARCHAR(1000) NULL,
    StartDate        DATE NOT NULL,
    EndDate          DATE NULL,
    Status           NVARCHAR(20) NOT NULL DEFAULT 'Ongoing' CHECK (Status IN ('Ongoing','Completed','Discontinued')),
    Notes            NVARCHAR(1000) NULL,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted        BIT NOT NULL DEFAULT 0
);
GO

/* ==================================================================
   PHARMACY
   ================================================================== */

CREATE TABLE Medications (
    MedicationID     INT IDENTITY(1,1) PRIMARY KEY,
    MedicineName     NVARCHAR(150) NOT NULL,
    GenericName      NVARCHAR(150) NULL,
    BrandName        NVARCHAR(150) NULL,
    Category         NVARCHAR(100) NULL,
    Strength         NVARCHAR(50) NULL,
    DosageForm       NVARCHAR(50) NULL,        -- Tablet, Syrup, Injection...
    Manufacturer     NVARCHAR(150) NULL,
    UnitPrice        DECIMAL(10,2) NOT NULL DEFAULT 0,
    StockQuantity    INT NOT NULL DEFAULT 0,
    ReorderLevel     INT NOT NULL DEFAULT 10,
    ExpiryDate       DATE NULL,
    Status           NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active','Discontinued')),
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted        BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE Prescriptions (
    PrescriptionID   INT IDENTITY(1,1) PRIMARY KEY,
    PatientID        INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    DoctorID         INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
    AppointmentID    INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID),
    PrescriptionDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Notes            NVARCHAR(1000) NULL,
    Status           NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active','Fulfilled','Cancelled')),
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted        BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE PrescriptionItems (
    PrescriptionItemID INT IDENTITY(1,1) PRIMARY KEY,
    PrescriptionID    INT NOT NULL FOREIGN KEY REFERENCES Prescriptions(PrescriptionID),
    MedicationID      INT NOT NULL FOREIGN KEY REFERENCES Medications(MedicationID),
    Dosage            NVARCHAR(100) NULL,
    Frequency         NVARCHAR(100) NULL,
    Duration          NVARCHAR(100) NULL,
    Route             NVARCHAR(50) NULL,        -- Oral, IV, Topical...
    Quantity          INT NOT NULL DEFAULT 1,
    Instructions      NVARCHAR(500) NULL,
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ==================================================================
   LABORATORY
   ================================================================== */

CREATE TABLE LaboratoryTests (
    LabTestID        INT IDENTITY(1,1) PRIMARY KEY,
    TestName         NVARCHAR(150) NOT NULL,
    Category         NVARCHAR(100) NULL,
    Description      NVARCHAR(500) NULL,
    NormalRange      NVARCHAR(100) NULL,
    Unit             NVARCHAR(30) NULL,
    Price            DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsActive         BIT NOT NULL DEFAULT 1,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE LaboratoryRequests (
    LabRequestID     INT IDENTITY(1,1) PRIMARY KEY,
    PatientID        INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    DoctorID         INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorID),
    AppointmentID    INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID),
    LabTestID        INT NOT NULL FOREIGN KEY REFERENCES LaboratoryTests(LabTestID),
    RequestDate      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Priority         NVARCHAR(20) NOT NULL DEFAULT 'Routine' CHECK (Priority IN ('Routine','Urgent','STAT')),
    Status           NVARCHAR(20) NOT NULL DEFAULT 'Requested'
                     CHECK (Status IN ('Requested','Collected','Processing','Completed','Cancelled')),
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE LaboratoryResults (
    LabResultID      INT IDENTITY(1,1) PRIMARY KEY,
    LabRequestID     INT NOT NULL FOREIGN KEY REFERENCES LaboratoryRequests(LabRequestID),
    ResultValue      NVARCHAR(100) NULL,
    NormalRange      NVARCHAR(100) NULL,
    Unit             NVARCHAR(30) NULL,
    ResultStatus     NVARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (ResultStatus IN ('Normal','Abnormal','Critical')),
    TechnicianUserID INT NULL FOREIGN KEY REFERENCES Users(UserID),
    ResultDate       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Notes            NVARCHAR(500) NULL,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ==================================================================
   BILLING
   ================================================================== */

CREATE TABLE Services (
    ServiceID        INT IDENTITY(1,1) PRIMARY KEY,
    ServiceName      NVARCHAR(150) NOT NULL,
    Category         NVARCHAR(100) NULL,
    Description      NVARCHAR(500) NULL,
    Price            DECIMAL(10,2) NOT NULL DEFAULT 0,
    DurationMinutes  INT NULL,
    Status           NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active','Inactive')),
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE Invoices (
    InvoiceID        INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNumber    NVARCHAR(30) NOT NULL UNIQUE,
    PatientID        INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    AppointmentID    INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID),
    InvoiceDate      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    DueDate          DATE NULL,
    Subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0,
    Discount         DECIMAL(10,2) NOT NULL DEFAULT 0,
    Tax              DECIMAL(10,2) NOT NULL DEFAULT 0,
    Total            DECIMAL(10,2) NOT NULL DEFAULT 0,
    PaidAmount       DECIMAL(10,2) NOT NULL DEFAULT 0,
    RemainingBalance AS (Total - PaidAmount) PERSISTED,
    Status           NVARCHAR(20) NOT NULL DEFAULT 'Unpaid'
                     CHECK (Status IN ('Unpaid','Partially Paid','Paid','Cancelled','Overdue')),
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted        BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE InvoiceItems (
    InvoiceItemID    INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID        INT NOT NULL FOREIGN KEY REFERENCES Invoices(InvoiceID),
    ServiceID        INT NULL FOREIGN KEY REFERENCES Services(ServiceID),
    Description      NVARCHAR(300) NOT NULL,
    Quantity         INT NOT NULL DEFAULT 1,
    UnitPrice        DECIMAL(10,2) NOT NULL DEFAULT 0,
    Total            AS (Quantity * UnitPrice) PERSISTED
);
GO

CREATE TABLE Payments (
    PaymentID        INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID        INT NOT NULL FOREIGN KEY REFERENCES Invoices(InvoiceID),
    PatientID        INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientID),
    Amount           DECIMAL(10,2) NOT NULL,
    PaymentMethod    NVARCHAR(20) NOT NULL CHECK (PaymentMethod IN ('Cash','Card','Bank Transfer','QR Payment','Other')),
    PaymentDate      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ReferenceNumber  NVARCHAR(100) NULL,
    Notes            NVARCHAR(500) NULL,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ==================================================================
   SYSTEM
   ================================================================== */

CREATE TABLE Notifications (
    NotificationID   INT IDENTITY(1,1) PRIMARY KEY,
    UserID           INT NULL FOREIGN KEY REFERENCES Users(UserID), -- NULL = broadcast
    Title            NVARCHAR(150) NOT NULL,
    Message          NVARCHAR(500) NOT NULL,
    NotificationType NVARCHAR(50) NOT NULL,  -- Appointment, Stock, Lab, Billing...
    IsRead           BIT NOT NULL DEFAULT 0,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE AuditLogs (
    AuditLogID       INT IDENTITY(1,1) PRIMARY KEY,
    UserID           INT NULL FOREIGN KEY REFERENCES Users(UserID),
    Action           NVARCHAR(50) NOT NULL,   -- Login, Create, Update, Delete...
    Entity           NVARCHAR(100) NOT NULL,  -- Patient, Appointment...
    EntityID         INT NULL,
    OldValue         NVARCHAR(MAX) NULL,
    NewValue         NVARCHAR(MAX) NULL,
    IPAddress        NVARCHAR(64) NULL,
    UserAgent        NVARCHAR(300) NULL,
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
