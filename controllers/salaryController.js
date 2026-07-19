const { connectDB, sql } = require("../config/db");
const pdfService = require("../services/pdfService");
const qrService = require("../services/qrService");
const path = require("path");

// const SalarySlipPDF = require("../services/pdfService");

// ===============================
// Generate Payroll
// ===============================


const SalarySlipPDF = require("../services/salarySlipService");




exports.generateSalarySlip = async (req, res) => {

    try {

        const payrollId = req.params.payrollId;

        const pool = await connectDB();

        //-------------------------------------------------------
        // Company Information
        //-------------------------------------------------------

        const companyResult = await pool.request().query(`
            SELECT TOP 1 *
            FROM CompanySettings
            WHERE IsActive = 1
        `);

        const company = companyResult.recordset[0];

        //-------------------------------------------------------
        // Salary Slip Data
        //-------------------------------------------------------

        const salaryResult = await pool.request()

            .input("PayrollID", sql.Int, payrollId)

            .query(`
                SELECT *
                FROM vw_SalarySlip
                WHERE PayrollID='1'
            `);

        if (salaryResult.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Payroll not found"

            });

        }

        const salary = salaryResult.recordset[0];

        //-------------------------------------------------------
        // Generate QR
        //-------------------------------------------------------

        const qr = await qrService.generateQRCode(

            salary.VerificationCode,

            company.QRBaseURL

        );

        //-------------------------------------------------------
        // Create PDF
        //-------------------------------------------------------

        const pdf = new SalarySlipPDF(company);

        pdf.drawHeader();

        pdf.drawWatermark();

      // pdf.sectionTitle("Employee Information",110);

        // Remaining methods will be added in Part 3.1B.2.2
         pdf.drawEmployeeInfo(salary);
        
         pdf.drawAttendanceSummary(salary);

         pdf.drawEarningsDeductions(salary);

         pdf.drawNetSalary(salary);
        pdf.drawDeclaration(salary);
         //pdf.drawEarningsTable(salary);
        //pdf.drawDeductionsTable(salary);
         pdf.drawPaymentDetails(salary);
         pdf.drawQRCode(qr.filePath);
         pdf.drawSignature();

        pdf.drawFooter();

        pdf.addPageNumbers();

        //-------------------------------------------------------
        // Save PDF
        //-------------------------------------------------------

        const fileName =
            `SalarySlip_${salary.EmployeeCode}_${salary.PayrollMonth}_${salary.PayrollYear}.pdf`;

        const filePath = path.join(

            __dirname,

            "../salary_slips",

            fileName

        );

        await pdf.save(filePath);

        //-------------------------------------------------------
        // Save PDF Path
        //-------------------------------------------------------

        await pool.request()

            .input("PayrollID", sql.Int, payrollId)

            .input("EmployeeID", sql.Int, salary.EmployeeID)

            .input("PDFPath", sql.NVarChar, filePath)

            .input("QRCodePath", sql.NVarChar, qr.filePath)

            .input("GeneratedBy", sql.Int, req.user.employeeId)

            .execute("sp_SaveSalarySlip");

        //-------------------------------------------------------
        // Download PDF
        //-------------------------------------------------------

        return res.download(filePath);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

};

exports.generatePayroll = async (req, res) => {

    try {

        const { employeeId, month, year } = req.body;

        const pool = await connectDB();

        await pool.request()
            .input("EmployeeID", sql.Int, employeeId)
            .input("Month", sql.Int, month)
            .input("Year", sql.Int, year)
            .execute("sp_CalculatePayroll");

        res.json({
            success: true,
            message: "Payroll Generated Successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ===============================
// Employee Salary History
// ===============================
exports.salaryHistory = async (req, res) => {

    try {

        const pool = await connectDB();

        const result = await pool.request()
            .input("EmployeeID", sql.Int, req.params.employeeId)
            .execute("sp_GetEmployeeSalaryHistory");

        res.json(result.recordset);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ===============================
// Payroll Dashboard
// ===============================
exports.payrollDashboard = async (req, res) => {

    try {

        const pool = await connectDB();

        const result = await pool.request()
            .execute("sp_PayrollDashboard");

        res.json(result.recordset[0]);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ===============================
// Mark Salary Paid
// ===============================
exports.paySalary = async (req, res) => {

    try {

        const {
            payrollId,
            paymentMode,
            transactionNo
        } = req.body;

        const pool = await connectDB();

        await pool.request()
            .input("PayrollID", sql.Int, payrollId)
            .input("PaymentMode", sql.NVarChar, paymentMode)
            .input("TransactionNo", sql.NVarChar, transactionNo)
            .execute("sp_PaySalary");

        res.json({
            success: true,
            message: "Salary Paid Successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ===============================
// Get Payroll List
// ===============================
exports.getPayroll = async (req, res) => {

    try {

        const pool = await connectDB();

        const result = await pool.request().query(`
            SELECT
                p.PayrollID,
                e.EmployeeCode,
                e.FirstName,
                e.LastName,
                p.PayrollMonth,
                p.PayrollYear,
                p.GrossSalary,
                p.Bonus,
                p.Deduction,
                p.NetSalary,
                p.PaymentStatus,
                p.GeneratedDate
            FROM Payroll p
            INNER JOIN Employees e
                ON p.EmployeeID = e.EmployeeID
            ORDER BY p.GeneratedDate DESC
        `);

        res.json(result.recordset);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ===============================
// Get Payroll By ID
// ===============================
exports.getPayrollById = async (req, res) => {

    try {

        const pool = await connectDB();

        const result = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                SELECT *
                FROM Payroll
                WHERE PayrollID=@id
            `);

        if (result.recordset.length === 0)
            return res.status(404).json({
                success: false,
                message: "Payroll Not Found"
            });

        res.json(result.recordset[0]);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


exports.downloadSalarySlip = async (req, res) => {

    try {

        const payrollId = req.params.id;

        const pool = await connectDB();

        const result = await pool.request()
            .input("id", sql.Int, payrollId)
            .query(`
                SELECT

                    p.*,

                    e.EmployeeCode,
                    e.FirstName,
                    e.LastName,
                    e.Designation,

                    d.DepartmentName

                FROM Payroll p

                INNER JOIN Employees e
                    ON p.EmployeeID=e.EmployeeID

                INNER JOIN Departments d
                    ON e.DepartmentID=d.DepartmentID

                WHERE PayrollID=@id
            `);

        if (result.recordset.length === 0)
            return res.status(404).json({
                message: "Payroll Not Found"
            });

        const data = result.recordset[0];

        const pdf = await pdfService.generateSalarySlip(
            data,
            data
        );

        res.download(pdf);

    } catch (err) {

        res.status(500).json(err);

    }

};

exports.generateQR = async (req, res) => {

    try {

        const { payrollId } = req.body;

        const pool = await connectDB();

        // Get Salary Slip Information
        const result = await pool.request()
            .input("PayrollID", sql.Int, payrollId)
            .query(`
                SELECT
                    SalarySlipID,
                    VerificationCode
                FROM SalarySlips
                WHERE PayrollID = '1'
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Salary Slip not found."
            });

        }

        const slip = result.recordset[0];

        // Get Company Base URL
        const company = await pool.request().query(`
            SELECT TOP 1 QRBaseURL
            FROM CompanySettings
            WHERE IsActive = 1
        `);

        const baseUrl = company.recordset[0].QRBaseURL;

        const qr = await qrService.generateQRCode(
            slip.VerificationCode,
            baseUrl
        );

        // Save QR Path
        await pool.request()
            .input("QRCodePath", sql.NVarChar, qr.filePath)
            .input("SalarySlipID", sql.Int, slip.SalarySlipID)
            .query(`
                UPDATE SalarySlips
                SET QRCodePath = @QRCodePath
                WHERE SalarySlipID = @SalarySlipID
            `);

        res.json({
            success: true,
            message: "QR Code Generated Successfully",
            qr
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};