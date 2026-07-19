const express = require("express");

const router = express.Router();

const attendance = require("../controllers/attendanceController");

const {
    verifyToken,
    isAdmin,
    isEmployee
} = require("../middleware/authMiddleware");

// Employee

router.post(
    "/checkin",
    verifyToken,
    isEmployee,
    attendance.checkIn
);

router.post(
    "/checkout",
    verifyToken,
    isEmployee,
    attendance.checkOut
);

// Admin

router.get(
    "/today",
    verifyToken,
    isAdmin,
    attendance.todayAttendance
);

router.get(
    "/employee/:id",
    verifyToken,
    attendance.employeeHistory
);

router.get(
    "/monthly",
    verifyToken,
    attendance.monthlyAttendance
);

module.exports = router;