/*
   One-command database setup for Clinic Patient History System.
   Run with sqlcmd from the repository root:

   sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -i database/run_all.sql

   For Windows Integrated Authentication, use:

   sqlcmd -S localhost -E -C -i database/run_all.sql
*/

:on error exit

:r database/01_create_database.sql
:r database/02_tables.sql
:r database/03_indexes.sql
:r database/04_views.sql
:r database/05_stored_procedures.sql
:r database/06_seed_data.sql
:r database/07_dashboard_demo_data.sql

PRINT 'ClinicPatientHistoryDB setup completed successfully.';
GO