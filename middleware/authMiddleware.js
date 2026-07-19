const jwt = require("jsonwebtoken");
const multer = require("multer");
exports.verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;
  console.log("header"+authHeader);
    if (!authHeader)
        return res.status(401).json({
            message: "Token Missing"
        });

    const token = authHeader.split(" ")[1];
    console.log("token"+token);
    try {

        const decoded = jwt.verify(
            token,
            "AttendanceSystemSecret123"
        );

        req.user = decoded;

        next();

    } catch {

        res.status(401).json({
            message: "Invalid Token"
        });

    }

};

exports.isAdmin = (req, res, next) => {

    if (req.user.role !== "Admin")
        return res.status(403).json({
            message: "Admin Only"
        });

    next();

};

exports.isEmployee = (req, res, next) => {

    if (req.user.role !== "Employee")
        return res.status(403).json({
            message: "Employee Only"
        });

    next();

};