const express = require("express");

const router = express.Router();

const dashboard = require("../controllers/dashboardController");

const {
    verifyToken,
    isAdmin,
    isEmployee
} = require("../middleware/authMiddleware");

router.get(
    "/admin",
    verifyToken,
    isAdmin,
    dashboard.adminDashboard
);

router.get(
    "/employee",
    verifyToken,
    isEmployee,
    dashboard.employeeDashboard
);

module.exports = router;