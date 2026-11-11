/* ==================================================================
   06_seed_data.sql
   Realistic seed data for development.
   Demo password for ALL accounts is set below (see NOTE).
   ================================================================== */

USE ClinicPatientHistoryDB;
GO

/* ------------------------------------------------------------------
   NOTE ON PASSWORDS
   PasswordHash values below are bcrypt hashes (cost 10) of the demo
   passwords documented in the README (e.g. Passw0rd!123).
   Replace/regenerate them via POST /api/auth/seed-hash in dev if you
   change bcrypt cost, or just re-hash with bcrypt and UPDATE Users.
   ------------------------------------------------------------------ */

-- ROLES
INSERT INTO Roles (RoleName, Description) VALUES
('Admin', 'Full system access'),
('Doctor', 'Clinical staff - can manage patients, diagnoses, treatments'),
('Nurse', 'Clinical support - vitals, medical history'),
('Receptionist', 'Front desk - patients, appointments'),
('Pharmacist', 'Pharmacy - medications, prescriptions'),
('Lab Technician', 'Laboratory - tests and results'),
('Accountant', 'Billing - invoices, payments');
GO

-- PERMISSIONS (representative set)
INSERT INTO Permissions (PermissionCode, Description) VALUES
('patients.view', 'View patients'),
('patients.create', 'Create patients'),
('patients.update', 'Update patients'),
('patients.delete', 'Delete patients'),
('appointments.view', 'View appointments'),
('appointments.manage', 'Create/update/cancel appointments'),
('doctors.manage', 'Manage doctors'),
('departments.manage', 'Manage departments'),
('medical.manage', 'Manage medical records'),
('pharmacy.manage', 'Manage medications & prescriptions'),
('lab.manage', 'Manage laboratory tests/requests/results'),
('billing.manage', 'Manage invoices & payments'),
('reports.view', 'View reports'),
('users.manage', 'Manage system users'),
('audit.view', 'View audit logs');
GO

-- ROLE PERMISSIONS: Admin gets everything
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Admin'), PermissionID FROM Permissions;

-- Doctor
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Doctor'), PermissionID
FROM Permissions WHERE PermissionCode IN ('patients.view','appointments.view','appointments.manage','medical.manage','pharmacy.manage','lab.manage','reports.view');

-- Nurse
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Nurse'), PermissionID
FROM Permissions WHERE PermissionCode IN ('patients.view','appointments.view','medical.manage');

-- Receptionist
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Receptionist'), PermissionID
FROM Permissions WHERE PermissionCode IN ('patients.view','patients.create','patients.update','appointments.view','appointments.manage');

-- Pharmacist
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Pharmacist'), PermissionID
FROM Permissions WHERE PermissionCode IN ('patients.view','pharmacy.manage');

-- Lab Technician
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Lab Technician'), PermissionID
FROM Permissions WHERE PermissionCode IN ('patients.view','lab.manage');

-- Accountant
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Accountant'), PermissionID
FROM Permissions WHERE PermissionCode IN ('patients.view','billing.manage','reports.view');
GO

/* ------------------------------------------------------------------
   DEMO USERS
   All passwords use the SAME bcrypt hash below, which corresponds to
   the plaintext password 'Passw0rd!123'. In the running app, use the
   demo emails with password: Passw0rd!123  (see README for per-role
   emails). This keeps the seed file portable without needing to
   invoke Node/bcrypt during a raw SQL import.
   ------------------------------------------------------------------ */
DECLARE @DemoHash NVARCHAR(255) = '$2b$10$b9wOTXHnCKU5CPX/6wFqKeKTEtmbM6XShGtlJs78g/9/bqgUbLLoG'; -- Passw0rd!123

INSERT INTO Users (RoleID, FullName, Email, PasswordHash, Phone, IsActive) VALUES
((SELECT RoleID FROM Roles WHERE RoleName='Admin'),          'System Administrator', 'admin@clinic.com',      @DemoHash, '855-11-000001', 1),
((SELECT RoleID FROM Roles WHERE RoleName='Doctor'),         'Dr. Sophal Chan',       'doctor@clinic.com',     @DemoHash, '855-11-000002', 1),
((SELECT RoleID FROM Roles WHERE RoleName='Nurse'),          'Sreymom Heng',          'nurse@clinic.com',      @DemoHash, '855-11-000003', 1),
((SELECT RoleID FROM Roles WHERE RoleName='Receptionist'),   'Dara Sok',              'reception@clinic.com',  @DemoHash, '855-11-000004', 1),
((SELECT RoleID FROM Roles WHERE RoleName='Pharmacist'),     'Vanna Ly',              'pharmacy@clinic.com',   @DemoHash, '855-11-000005', 1),
((SELECT RoleID FROM Roles WHERE RoleName='Lab Technician'), 'Ratanak Pich',          'lab@clinic.com',        @DemoHash, '855-11-000006', 1),
((SELECT RoleID FROM Roles WHERE RoleName='Accountant'),     'Chenda Ouk',            'accountant@clinic.com', @DemoHash, '855-11-000007', 1);
GO

-- DEPARTMENTS
INSERT INTO Departments (DepartmentName, Description) VALUES
('General Medicine', 'Primary care and general consultations'),
('Pediatrics', 'Child healthcare'),
('Cardiology', 'Heart and cardiovascular care'),
('Dermatology', 'Skin conditions'),
('Orthopedics', 'Bones, joints and muscles'),
('Obstetrics & Gynecology', 'Women''s health'),
('ENT', 'Ear, nose and throat'),
('Dentistry', 'Dental care');
GO

-- DOCTORS
INSERT INTO Doctors (DepartmentID, DoctorCode, FirstName, LastName, Gender, Specialization, LicenseNumber, Phone, Email, Status) VALUES
((SELECT DepartmentID FROM Departments WHERE DepartmentName='General Medicine'), 'DR-0001', 'Sophal', 'Chan', 'Male', 'General Practice', 'LIC-1001', '855-12-111001', 'sophal.chan@clinic.com', 'Active'),
((SELECT DepartmentID FROM Departments WHERE DepartmentName='Pediatrics'),        'DR-0002', 'Sokha', 'Meas', 'Female', 'Pediatrics', 'LIC-1002', '855-12-111002', 'sokha.meas@clinic.com', 'Active'),
((SELECT DepartmentID FROM Departments WHERE DepartmentName='Cardiology'),        'DR-0003', 'Piseth', 'Vong', 'Male', 'Cardiology', 'LIC-1003', '855-12-111003', 'piseth.vong@clinic.com', 'Active'),
((SELECT DepartmentID FROM Departments WHERE DepartmentName='Dermatology'),       'DR-0004', 'Chanlina', 'Kong', 'Female', 'Dermatology', 'LIC-1004', '855-12-111004', 'chanlina.kong@clinic.com', 'Active'),
((SELECT DepartmentID FROM Departments WHERE DepartmentName='Orthopedics'),       'DR-0005', 'Rithy', 'Sam', 'Male', 'Orthopedic Surgery', 'LIC-1005', '855-12-111005', 'rithy.sam@clinic.com', 'Active'),
((SELECT DepartmentID FROM Departments WHERE DepartmentName='Obstetrics & Gynecology'), 'DR-0006', 'Malis', 'Ith', 'Female', 'OB-GYN', 'LIC-1006', '855-12-111006', 'malis.ith@clinic.com', 'Active'),
((SELECT DepartmentID FROM Departments WHERE DepartmentName='ENT'),               'DR-0007', 'Kosal', 'Nhek', 'Male', 'ENT Surgery', 'LIC-1007', '855-12-111007', 'kosal.nhek@clinic.com', 'Active'),
((SELECT DepartmentID FROM Departments WHERE DepartmentName='Dentistry'),         'DR-0008', 'Sreynich', 'Pou', 'Female', 'General Dentistry', 'LIC-1008', '855-12-111008', 'sreynich.pou@clinic.com', 'Active');
GO

-- PATIENTS (30+)
DECLARE @Names TABLE (FirstName NVARCHAR(100), LastName NVARCHAR(100), Gender NVARCHAR(10));
INSERT INTO @Names VALUES
('Sopheak','Chhorn','Male'),('Srey Pov','Lim','Female'),('Vuthy','Roeun','Male'),('Chanthou','Yin','Female'),
('Bunthoeun','Chea','Male'),('Sreyleak','Ouk','Female'),('Pisach','Sok','Male'),('Kanha','Tep','Female'),
('Vichea','Ly','Male'),('Sreynoch','Heng','Female'),('Thearith','Chum','Male'),('Chanmony','Ros','Female'),
('Sovann','Bou','Male'),('Sreymao','Nop','Female'),('Ratana','Prak','Male'),('Chanra','Sar','Female'),
('Veasna','Khiev','Male'),('Sreypich','Nou','Female'),('Chetra','Meng','Male'),('Sreyroth','Chin','Female'),
('Bora','Lay','Male'),('Sokunthea','Doung','Female'),('Piseth','Ang','Male'),('Channary','Sim','Female'),
('Vibol','Keo','Male'),('Sreyneang','Va','Female'),('Sarath','Im','Male'),('Chanlida','Uy','Female'),
('Rathana','Tuy','Male'),('Sreymom','Chhay','Female'),('Dara','Or','Male'),('Kunthea','Pen','Female');

INSERT INTO Patients (PatientCode, FirstName, LastName, DateOfBirth, Gender, BloodType, Phone, Email, Address, EmergencyContactName, EmergencyContactPhone, Status)
SELECT
    'PT-' + RIGHT('000000' + CAST(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS VARCHAR(10)), 6),
    FirstName, LastName,
    DATEADD(YEAR, -(18 + (ABS(CHECKSUM(NEWID())) % 60)), DATEADD(DAY, -(ABS(CHECKSUM(NEWID())) % 365), GETDATE())),
    Gender,
    (SELECT TOP 1 v FROM (VALUES ('A+'),('A-'),('B+'),('B-'),('AB+'),('AB-'),('O+'),('O-')) AS t(v) ORDER BY NEWID()),
    '855-9' + RIGHT('0000000' + CAST(ABS(CHECKSUM(NEWID())) % 10000000 AS VARCHAR(10)), 7),
    LOWER(FirstName) + '.' + LOWER(LastName) + '@example.com',
    'Phnom Penh, Cambodia',
    'Emergency Contact ' + FirstName,
    '855-9' + RIGHT('0000000' + CAST(ABS(CHECKSUM(NEWID())) % 10000000 AS VARCHAR(10)), 7),
    'Active'
FROM @Names;
GO

-- LAB TESTS
INSERT INTO LaboratoryTests (TestName, Category, NormalRange, Unit, Price) VALUES
('Complete Blood Count', 'Hematology', '4.5-11.0', 'x10^9/L', 15.00),
('Blood Glucose (Fasting)', 'Chemistry', '70-100', 'mg/dL', 8.00),
('Lipid Panel', 'Chemistry', '<200', 'mg/dL', 20.00),
('Liver Function Test', 'Chemistry', '7-56', 'U/L', 25.00),
('Urinalysis', 'Urology', 'Negative', '-', 10.00),
('Thyroid Function (TSH)', 'Endocrinology', '0.4-4.0', 'mIU/L', 18.00),
('HbA1c', 'Chemistry', '<5.7', '%', 22.00),
('COVID-19 PCR', 'Microbiology', 'Negative', '-', 30.00);
GO

-- SERVICES
INSERT INTO Services (ServiceName, Category, Price, DurationMinutes, Status) VALUES
('General Consultation', 'Consultation', 15.00, 20, 'Active'),
('Specialist Consultation', 'Consultation', 30.00, 30, 'Active'),
('Vaccination', 'Preventive', 10.00, 15, 'Active'),
('Minor Procedure', 'Procedure', 50.00, 45, 'Active'),
('Ultrasound Scan', 'Imaging', 35.00, 30, 'Active'),
('X-Ray', 'Imaging', 25.00, 15, 'Active'),
('Dental Cleaning', 'Dental', 20.00, 30, 'Active');
GO

-- MEDICATIONS
INSERT INTO Medications (MedicineName, GenericName, Category, Strength, DosageForm, Manufacturer, UnitPrice, StockQuantity, ReorderLevel, ExpiryDate, Status) VALUES
('Paracetamol', 'Paracetamol', 'Analgesic', '500mg', 'Tablet', 'Cambodia Pharma', 0.05, 5000, 500, DATEADD(YEAR,2,GETDATE()), 'Active'),
('Amoxicillin', 'Amoxicillin', 'Antibiotic', '250mg', 'Capsule', 'Cambodia Pharma', 0.10, 2000, 300, DATEADD(YEAR,1,GETDATE()), 'Active'),
('Ibuprofen', 'Ibuprofen', 'NSAID', '400mg', 'Tablet', 'MediCam', 0.08, 3000, 300, DATEADD(YEAR,2,GETDATE()), 'Active'),
('Cetirizine', 'Cetirizine', 'Antihistamine', '10mg', 'Tablet', 'MediCam', 0.06, 1500, 200, DATEADD(YEAR,2,GETDATE()), 'Active'),
('Omeprazole', 'Omeprazole', 'PPI', '20mg', 'Capsule', 'MediCam', 0.12, 1000, 150, DATEADD(YEAR,1,GETDATE()), 'Active'),
('Metformin', 'Metformin', 'Antidiabetic', '500mg', 'Tablet', 'Cambodia Pharma', 0.09, 40, 200, DATEADD(MONTH,3,GETDATE()), 'Active'),
('Amlodipine', 'Amlodipine', 'Antihypertensive', '5mg', 'Tablet', 'Cambodia Pharma', 0.11, 800, 150, DATEADD(YEAR,1,GETDATE()), 'Active'),
('ORS Sachet', 'Oral Rehydration Salts', 'Electrolyte', '1 sachet', 'Powder', 'MediCam', 0.15, 20, 100, DATEADD(MONTH,1,GETDATE()), 'Active');
GO
