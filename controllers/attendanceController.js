const { connectDB, sql } = require("../config/db");

// Employee Check In
exports.checkIn = async (req, res) => {

    try {

        const { employeeId } = req.body;

        const pool = await connectDB();

        // Already checked in?
        const exist = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query(`
                SELECT *
                FROM Attendance
                WHERE EmployeeID=@employeeId
                AND AttendanceDate=CAST(GETDATE() AS DATE)
            `);

        if (exist.recordset.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Already Checked In Today"
            });

        }

        await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query(`
                INSERT INTO Attendance
                (
                    EmployeeID,
                    AttendanceDate,
                    CheckIn,
                    Status
                )
                VALUES
                (
                    @employeeId,
                    CAST(GETDATE() AS DATE),
                    GETDATE(),
                    'Present'
                )
            `);

        res.json({
            success: true,
            message: "Check In Successful"
        });

    }
    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// Employee Check Out
exports.checkOut = async (req, res) => {

    try {

        const { employeeId } = req.body;

        const pool = await connectDB();

        const result = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query(`
                SELECT *
                FROM Attendance
                WHERE EmployeeID=@employeeId
                AND AttendanceDate=CAST(GETDATE() AS DATE)
            `);

        if (result.recordset.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Please Check In First"
            });

        }

        const attendance = result.recordset[0];

        if (attendance.CheckOut) {

            return res.status(400).json({
                success: false,
                message: "Already Checked Out"
            });

        }

        await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query(`
                UPDATE Attendance

                SET

                    CheckOut=GETDATE(),

                    WorkingHours=
                    DATEDIFF
                    (
                        MINUTE,
                        CheckIn,
                        GETDATE()
                    )/60.0

                WHERE EmployeeID=@employeeId

                AND AttendanceDate=CAST(GETDATE() AS DATE)
            `);

        res.json({
            success: true,
            message: "Check Out Successful"
        });

    }
    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// Today's Attendance (Admin)
exports.todayAttendance = async (req, res) => {

    try {

        const pool = await connectDB();

        const result = await pool.request().query(`
            SELECT

                e.EmployeeCode,

                e.FirstName,

                e.LastName,

                a.CheckIn,

                a.CheckOut,

                a.WorkingHours,

                a.Status

            FROM Attendance a

            INNER JOIN Employees e

            ON a.EmployeeID=e.EmployeeID

            WHERE a.AttendanceDate=CAST(GETDATE() AS DATE)

            ORDER BY e.FirstName
        `);

        res.json(result.recordset);

    }
    catch (err) {

        res.status(500).json(err);

    }

};

// Employee Attendance History
exports.employeeHistory = async (req, res) => {

    try {

        const pool = await connectDB();

        const result = await pool.request()
            .input("employeeId", sql.Int, req.params.id)
            .query(`
                SELECT *

                FROM Attendance

                WHERE EmployeeID=@employeeId

                ORDER BY AttendanceDate DESC
            `);

        res.json(result.recordset);

    }
    catch (err) {

        res.status(500).json(err);

    }

};

// Monthly Attendance
exports.monthlyAttendance = async (req, res) => {

    try {

        const { employeeId, month, year } = req.query;

        const pool = await connectDB();

        const result = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .input("month", sql.Int, month)
            .input("year", sql.Int, year)
            .query(`
                SELECT *

                FROM Attendance

                WHERE EmployeeID=@employeeId

                AND MONTH(AttendanceDate)=@month

                AND YEAR(AttendanceDate)=@year

                ORDER BY AttendanceDate
            `);

        res.json(result.recordset);

    }
    catch (err) {

        res.status(500).json(err);

    }

};