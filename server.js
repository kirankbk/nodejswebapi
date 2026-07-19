// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const cors = require('cors');

// // const authRoutes = require('./routes/auth');
// // const employeeRoutes = require('./routes/employee');
// // const attendanceRoutes = require('./routes/attendance');
// // const salaryRoutes = require('./routes/salary');

// // const app = express();

// // app.use(cors());
// // app.use(bodyParser.json());

// // app.use('/auth', authRoutes);
// // app.use('/employee', employeeRoutes);
// // app.use('/attendance', attendanceRoutes);
// // app.use('/salary', salaryRoutes);

// // app.listen(3000, () => {
// //     console.log("Server running on port 3000");
// // });

// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const sql = require('mssql');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const config = {
//     user: 'your_username',
//     password: 'your_password',
//     server: 'localhost',
//     database: 'AttendanceDB',
//     options: { encrypt: false, trustServerCertificate: true }
// };

// sql.connect(config).then(pool => {
//     if (pool.connected) console.log("Connected to SQL Server");

//     // Login
//     app.post('/auth/login', async (req, res) => {
//         const { username, password } = req.body;
//         const result = await pool.request()
//             .input('username', sql.NVarChar, username)
//             .input('password', sql.NVarChar, password)
//             .query("SELECT * FROM Employees WHERE Username=@username AND Password=@password");
//         if (result.recordset.length > 0) res.json(result.recordset[0]);
//         else res.status(401).send("Invalid credentials");
//     });

//     // Add Employee
//     app.post('/employee/add', async (req, res) => {
//         const { name, joiningDate, role, username, password } = req.body;
//         await pool.request()
//             .input('name', sql.NVarChar, name)
//             .input('joiningDate', sql.Date, joiningDate)
//             .input('role', sql.NVarChar, role)
//             .input('username', sql.NVarChar, username)
//             .input('password', sql.NVarChar, password)
//             .query("INSERT INTO Employees (Name, JoiningDate, Role, Username, Password) VALUES (@name,@joiningDate,@role,@username,@password)");
//         res.send("Employee added");
//     });

//     // Mark Attendance
//     app.post('/attendance/mark', async (req, res) => {
//         const { employeeId, date, status } = req.body;
//         await pool.request()
//             .input('employeeId', sql.Int, employeeId)
//             .input('date', sql.Date, date)
//             .input('status', sql.NVarChar, status)
//             .query("INSERT INTO Attendance (EmployeeID, Date, Status) VALUES (@employeeId,@date,@status)");
//         res.send("Attendance marked");
//     });

//     // Calculate Salary
//     app.post('/salary/calc', async (req, res) => {
//         const { employeeId, month, dailyWage } = req.body;
//         const result = await pool.request()
//             .input('employeeId', sql.Int, employeeId)
//             .input('month', sql.NVarChar, month)
//             .query("SELECT COUNT(*) AS PresentDays FROM Attendance WHERE EmployeeID=@employeeId AND Status='Present'");
//         const presentDays = result.recordset[0].PresentDays;
//         const salary = presentDays * dailyWage;
//         await pool.request()
//             .input('employeeId', sql.Int, employeeId)
//             .input('month', sql.NVarChar, month)
//             .input('presentDays', sql.Int, presentDays)
//             .input('salary', sql.Decimal(10,2), salary)
//             .query("INSERT INTO Salary (EmployeeID, Month, PresentDays, SalaryAmount) VALUES (@employeeId,@month,@presentDays,@salary)");
//         res.json({ presentDays, salary });
//     });

// }).catch(err => console.error(err));

// app.listen(3000, () => console.log("Server running on port 3000"));

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');
const { connectDB } = require("./config/db");
const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/auth");
const auth = require("./controllers/authController");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const path = require("path");
require('dotenv').config();
const {
    verifyToken,
    isAdmin,isEmployee
} = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
    "/qr_codes",
    express.static(path.join(__dirname, "qr_codes"))
);
const PORT = process.env.PORT || 3000;
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);
//router.post("/login", auth.login);
app.use("/api/auth", authRoutes);
const router = express.Router();
// SQL Server Windows Authentication
const config = {
    server: 'DESKTOP-AVNHU21\\SQLEXPRESS',
    database: 'AttendanceDB1',     // Change if your DB name is different
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};


app.use(

    "/uploads",

    express.static(

        path.join(__dirname, "uploads")

    )

);
sql.connect(config).then(pool => {
debugger
    console.log(config+"✅ Connected to SQL Server");

    // ================= LOGIN =================


    app.get("/employees", async (req, res) => {

        try {
    
            const pool = await connectDB();
    
            const result = await pool.request().query(`
                SELECT *
                FROM Employees
            `);
    
            res.json(result.recordset);
    
        }
        catch (err) {
    
            res.status(500).json(err);
    
        }
    
    });

    app.get(
        "/profile",
        verifyToken,
        isEmployee,
        (req, res) => {
    
            res.json(req.user);
    
        }
    );
    app.post('/auth/login', async (req, res) => {

        try {
            console.log(req.body);
            const { username, password } = req.body;

            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .input('password', sql.NVarChar, password)
                .query(`
                    SELECT *
                    FROM Users
                    WHERE Username=@username
                    AND Password=@password
                `);

            if (result.recordset.length > 0)
                res.json(result.recordset[0]);
            else
                res.status(401).json({ message: "Invalid Username or Password" });

        } catch (err) {
            res.status(500).json(err);
        }

    });
    app.get(
        "/employees",
        verifyToken,
        isAdmin,
        (req, res) => {
    
            res.json("Employee List");
    
        }
    );
    // ================= ADD EMPLOYEE =================
    app.post('/employee/add', async (req, res) => {

        try {

            const {
                name,
                joiningDate,
                role,
                username,
                password
            } = req.body;

            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('joiningDate', sql.Date, joiningDate)
                .input('role', sql.NVarChar, role)
                .input('username', sql.NVarChar, username)
                .input('password', sql.NVarChar, password)
                .query(`
                    INSERT INTO Employees
                    (
                        Name,
                        JoiningDate,
                        Role,
                        Username,
                        Password
                    )
                    VALUES
                    (
                        @name,
                        @joiningDate,
                        @role,
                        @username,
                        @password
                    )
                `);

            res.json({
                success: true,
                message: "Employee Added Successfully"
            });

        } catch (err) {
            res.status(500).json(err);
        }

    });

    // ================= MARK ATTENDANCE =================
    app.post('/attendance/mark', async (req, res) => {

        try {

            const {
                employeeId,
                date,
                status
            } = req.body;

            await pool.request()
                .input('employeeId', sql.Int, employeeId)
                .input('date', sql.Date, date)
                .input('status', sql.NVarChar, status)
                .query(`
                    INSERT INTO Attendance
                    (
                        EmployeeID,
                        Date,
                        Status
                    )
                    VALUES
                    (
                        @employeeId,
                        @date,
                        @status
                    )
                `);

            res.json({
                success: true,
                message: "Attendance Marked Successfully"
            });

        } catch (err) {
            res.status(500).json(err);
        }

    });
    // Salary Calculation
    app.get('/salary/:employeeId/:month/:year', async (req, res) => {
        try {
            await sql.connect(config);
            const { employeeId, month, year } = req.params;
            const result = await sql.query`
                SELECT COUNT(*) AS DaysPresent 
                FROM Attendance 
                WHERE EmployeeID=${employeeId} AND MONTH(Date)=${month} AND YEAR(Date)=${year} AND Status='Present'
            `;
            const daysPresent = result.recordset[0].DaysPresent;
            const salaryAmount = daysPresent * 1000; // Example: ₹1000/day
            res.json({ employeeId, month, year, daysPresent, salaryAmount });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });
    // ================= CALCULATE SALARY =================
    app.post('/salary/calc', async (req, res) => {

        try {

            const {
                employeeId,
                month,
                dailyWage
            } = req.body;

            const result = await pool.request()
                .input('employeeId', sql.Int, employeeId)
                .query(`
                    SELECT COUNT(*) AS PresentDays
                    FROM Attendance
                    WHERE EmployeeID=@employeeId
                    AND Status='Present'
                `);

            const presentDays = result.recordset[0].PresentDays;

            const salary = presentDays * dailyWage;

            await pool.request()
                .input('employeeId', sql.Int, employeeId)
                .input('month', sql.NVarChar, month)
                .input('presentDays', sql.Int, presentDays)
                .input('salary', sql.Decimal(10,2), salary)
                .query(`
                    INSERT INTO Salary
                    (
                        EmployeeID,
                        Month,
                        PresentDays,
                        SalaryAmount
                    )
                    VALUES
                    (
                        @employeeId,
                        @month,
                        @presentDays,
                        @salary
                    )
                `);

            res.json({
                presentDays,
                salary
            });

        } catch (err) {
            res.status(500).json(err);
        }

    });

}).catch(err => {
    console.log("❌ SQL Connection Error");
    console.log(err);
});

app.listen(PORT, () => {
    console.log("🚀 Server Running at http://localhost:"+PORT);
});
