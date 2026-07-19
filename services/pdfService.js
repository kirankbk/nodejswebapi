const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateSalarySlip = (salary, employee) => {

    return new Promise((resolve, reject) => {

        const folder = path.join(__dirname, "../salary_slips");

        if (!fs.existsSync(folder))
            fs.mkdirSync(folder);

        const fileName =
            `SalarySlip_${employee.EmployeeCode}_${salary.PayrollMonth}_${salary.PayrollYear}.pdf`;

        const filePath = path.join(folder, fileName);

        const doc = new PDFDocument({
            size: "A4",
            margin: 40
        });

        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        //------------------------------------------------
        // Company Logo
        //------------------------------------------------

        const logo = path.join(__dirname, "../assets/DhandaiLogo.png");

        if (fs.existsSync(logo)) {

            doc.image(logo, 40, 30, {
                width: 60
            });

        }

        //------------------------------------------------
        // Company Name
        //------------------------------------------------

        doc
            .fontSize(22)
            .text("ABC PRIVATE LIMITED", 120, 35);

        doc
            .fontSize(11)
            .text("Employee Salary Slip", 120, 65);

        doc.moveDown(2);

        //------------------------------------------------
        // Employee Details
        //------------------------------------------------

        doc.fontSize(12);

        doc.text(`Employee Code : ${employee.EmployeeCode}`);
        doc.text(`Employee Name : ${employee.FirstName} ${employee.LastName}`);
        doc.text(`Department : ${employee.DepartmentName}`);
        doc.text(`Designation : ${employee.Designation}`);
        doc.text(`Month : ${salary.PayrollMonth}/${salary.PayrollYear}`);

        doc.moveDown();

        //------------------------------------------------
        // Earnings Table
        //------------------------------------------------

        doc
            .fontSize(14)
            .text("Earnings", {
                underline: true
            });

        doc.moveDown(0.5);

        doc.text(`Basic Salary : ₹ ${salary.GrossSalary.toFixed(2)}`);
        doc.text(`Bonus : ₹ ${salary.Bonus.toFixed(2)}`);
        doc.text(`Overtime : ₹ ${salary.Overtime || 0}`);

        doc.moveDown();

        //------------------------------------------------
        // Deductions
        //------------------------------------------------

        doc
            .fontSize(14)
            .text("Deductions", {
                underline: true
            });

        doc.moveDown(0.5);

        doc.text(`Total Deduction : ₹ ${salary.Deduction.toFixed(2)}`);

        doc.moveDown();

        //------------------------------------------------
        // Net Salary
        //------------------------------------------------

        doc
            .fontSize(18)
            .fillColor("green")
            .text(`Net Salary : ₹ ${salary.NetSalary.toFixed(2)}`);

        doc.fillColor("black");

        doc.moveDown(3);

        //------------------------------------------------
        // Signature
        //------------------------------------------------

        doc.text("---------------------------------------");
        doc.text("Authorized Signature");

        doc.end();

        stream.on("finish", () => {

            resolve(filePath);

        });

        stream.on("error", reject);

    });

};