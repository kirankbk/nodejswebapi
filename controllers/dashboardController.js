const { connectDB, sql } = require("../config/db");

//========================================
// ADMIN DASHBOARD
//========================================

exports.adminDashboard = async (req, res) => {

    try {

        const pool = await connectDB();

        const totalEmployees = await pool.request().query(`
            SELECT COUNT(*) Total
            FROM Employees
            WHERE IsActive=1
        `);

        const presentToday = await pool.request().query(`
            SELECT COUNT(*) Total
            FROM Attendance
            WHERE AttendanceDate=CAST(GETDATE() AS DATE)
            AND Status='Present'
        `);

        const absentToday = await pool.request().query(`
            SELECT COUNT(*) Total
            FROM Employees
            WHERE EmployeeID NOT IN
            (
                SELECT EmployeeID
                FROM Attendance
                WHERE AttendanceDate=CAST(GETDATE() AS DATE)
            )
            AND IsActive=1
        `);

        const leaveToday = await pool.request().query(`
            SELECT COUNT(*) Total
            FROM LeaveApplications
            WHERE
            CAST(GETDATE() AS DATE)
            BETWEEN FromDate AND ToDate
            AND Status='Approved'
        `);

        const lateEmployees = await pool.request().query(`
            SELECT COUNT(*) Total
            FROM Attendance
            WHERE AttendanceDate=CAST(GETDATE() AS DATE)
            AND CAST(CheckIn AS TIME)>'09:15:00'
        `);

        const monthlySalary = await pool.request().query(`
            SELECT ISNULL(SUM(NetSalary),0) Salary
            FROM Salary
            WHERE SalaryMonth=MONTH(GETDATE())
            AND SalaryYear=YEAR(GETDATE())
        `);

        const recentAttendance = await pool.request().query(`
            SELECT TOP 10

                e.EmployeeCode,

                e.FirstName,

                a.CheckIn,

                a.CheckOut,

                a.Status

            FROM Attendance a

            INNER JOIN Employees e
            ON a.EmployeeID=e.EmployeeID

            ORDER BY AttendanceID DESC
        `);

        const departmentWise = await pool.request().query(`
            SELECT

                d.DepartmentName,

                COUNT(*) Total

            FROM Employees e

            INNER JOIN Departments d

            ON e.DepartmentID=d.DepartmentID

            GROUP BY d.DepartmentName
        `);

        const attendanceChart = await pool.request().query(`
            SELECT

                AttendanceDate,

                COUNT(*) Present

            FROM Attendance

            WHERE AttendanceDate>=DATEADD(DAY,-30,GETDATE())

            GROUP BY AttendanceDate

            ORDER BY AttendanceDate
        `);

        res.json({

            totalEmployees:
                totalEmployees.recordset[0].Total,

            presentToday:
                presentToday.recordset[0].Total,

            absentToday:
                absentToday.recordset[0].Total,

            leaveToday:
                leaveToday.recordset[0].Total,

            lateEmployees:
                lateEmployees.recordset[0].Total,

            monthlySalary:
                monthlySalary.recordset[0].Salary,

            recentAttendance:
                recentAttendance.recordset,

            departmentWise:
                departmentWise.recordset,

            attendanceChart:
                attendanceChart.recordset

        });

    }

    catch (err) {

        res.status(500).json(err);

    }

};

//========================================
// EMPLOYEE DASHBOARD
//========================================

exports.employeeDashboard = async (req, res) => {

    try {

        const employeeId = req.user.employeeId;

        const pool = await connectDB();

        const profile = await pool.request()
            .input("id", sql.Int, employeeId)
            .query(`
                SELECT
                EmployeeCode,
                FirstName,
                LastName,
                Designation,
                MonthlySalary
                FROM Employees
                WHERE EmployeeID=@id
            `);

        const today = await pool.request()
            .input("id", sql.Int, employeeId)
            .query(`
                SELECT *

                FROM Attendance

                WHERE EmployeeID=@id

                AND AttendanceDate=CAST(GETDATE() AS DATE)
            `);

        const monthly = await pool.request()
            .input("id", sql.Int, employeeId)
            .query(`
                SELECT

                SUM(CASE WHEN Status='Present' THEN 1 ELSE 0 END) PresentDays,

                SUM(CASE WHEN Status='Absent' THEN 1 ELSE 0 END) AbsentDays,

                SUM(CASE WHEN Status='Leave' THEN 1 ELSE 0 END) LeaveDays

                FROM Attendance

                WHERE EmployeeID=@id

                AND MONTH(AttendanceDate)=MONTH(GETDATE())

                AND YEAR(AttendanceDate)=YEAR(GETDATE())
            `);

        const lastAttendance = await pool.request()
            .input("id", sql.Int, employeeId)
            .query(`
                SELECT TOP 10 *

                FROM Attendance

                WHERE EmployeeID=@id

                ORDER BY AttendanceDate DESC
            `);

        res.json({

            profile:
                profile.recordset[0],

            today:
                today.recordset[0] || {},

            monthly:
                monthly.recordset[0],

            history:
                lastAttendance.recordset

        });

    }

    catch (err) {

        res.status(500).json(err);

    }

};