/* ==================================================================
   01_create_database.sql
   Creates the ClinicPatientHistoryDB database.
   Run this file first, as its own batch (sqlcmd or SSMS).
   ================================================================== */

IF DB_ID('ClinicPatientHistoryDB') IS NULL
BEGIN
    CREATE DATABASE ClinicPatientHistoryDB;
END
GO

ALTER DATABASE ClinicPatientHistoryDB SET READ_COMMITTED_SNAPSHOT ON;
GO

USE ClinicPatientHistoryDB;
GO
