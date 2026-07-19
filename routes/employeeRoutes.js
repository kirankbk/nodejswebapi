const express = require("express");
const router = express.Router();

const upload = require('../middleware/upload');
const employee = require("../controllers/employeeController");
const validateEmployee = require("../middleware/validateEmployee");
const {
    verifyToken,
    isAdmin
} = require("../middleware/authMiddleware");

// Generate Employee code
router.get(

    "/next-code",

    verifyToken,

    employee.getNextEmployeeCode

);


// ❌ Wrong: router.post('/profile', upload, handler)
// (upload is not a function, it’s an object)

// ✅ Correct:
router.post('/profile', upload.single('profilePic'), (req, res) => {
  res.json({
    success: true,
    file: req.file
  });
});


//router.post('/profile', upload.single('profilePic'), handler);

// Get All Employees
router.get("/", verifyToken, isAdmin, employee.getEmployees);

// Get Employee By ID
router.get("/:id", verifyToken, isAdmin, employee.getEmployeeById);

// Add Employee
router.post("/", verifyToken, isAdmin, upload.single("Photo"),


employee.CreateEmployee);

// Update Employee
router.put("/:id", verifyToken, isAdmin, upload.single("Photo"),

validateEmployee,
employee.updateEmployee);

// Delete Employee
router.delete("/:id", verifyToken, isAdmin, employee.deleteEmployee);

module.exports = router;