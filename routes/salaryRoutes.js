const express = require("express");

const router = express.Router();

const salary = require("../controllers/salaryController");

const {
    verifyToken,
    isAdmin,
    isEmployee
} = require("../middleware/authMiddleware");

// Generate Payroll (Admin)
router.post(
    "/generate",
    verifyToken,
    isAdmin,
    salary.generatePayroll
);

// Payroll Dashboard (Admin)
router.get(
    "/dashboard",
    verifyToken,
    isAdmin,
    salary.payrollDashboard
);

// Payroll List (Admin)
router.get(
    "/payroll",
    verifyToken,
    isAdmin,
    salary.getPayroll
);

// Payroll Details (Admin)
router.get(
    "/payroll/:id",
    verifyToken,
    isAdmin,
    salary.getPayrollById
);

// Mark Salary Paid (Admin)
router.put(
    "/pay",
    verifyToken,
    isAdmin,
    salary.paySalary
);
//downloadSalarySlip
router.get(
    "/slip/:id",
    verifyToken,
    salary.downloadSalarySlip
);
// Employee Salary History
router.get(
    "/history/:employeeId",
    verifyToken,
    salary.salaryHistory
);
//generateQR
router.post(
    "/generate-qr",
    verifyToken,
    isAdmin,
    salary.generateQR
);
//generateSalarySlip
router.get(

    "/generate/:payrollId",

    verifyToken,

    isAdmin,

    salary.generateSalarySlip

);

module.exports = router;