const PDFDocument = require("pdfkit");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment");
//const fs = require("fs");
class SalarySlipPDF {

    // constructor(company) {

    //     this.company = company;

    //     this.doc = new PDFDocument({

    //         size: "A4",

    //         margin: 40,

    //         bufferPages: true

    //     });

    //     this.pageWidth = this.doc.page.width;
    //     this.pageHeight = this.doc.page.height;

    //     this.primaryColor = "#0B5ED7";
    //     this.secondaryColor = "#198754";
    //     this.lightGray = "#F2F2F2";
    //     this.darkGray = "#444444";

    // }
    constructor(company) {

        this.company = company;
    
        this.doc = new PDFDocument({
            size: "A4",
            margin: 40,
            bufferPages: true
        });
    
        this.pageWidth = this.doc.page.width;
        this.pageHeight = this.doc.page.height;
    
        this.primaryColor = "#0B5ED7";
        this.secondaryColor = "#198754";
        this.lightGray = "#F5F5F5";
        this.borderColor = "#CFCFCF";
    
        this.currentY = 110;
    
    }

    /**
 * Draw Attendance Summary
 * @param {Object} employee
 */
drawAttendanceSummary(employee) {

    // Check if enough space exists
    this.checkPageBreak(130);

    //--------------------------------------------------
    // Section Title
    //--------------------------------------------------

    this.sectionTitle("ATTENDANCE SUMMARY", this.currentY);

    this.currentY += 30;

    //--------------------------------------------------
    // Prepare Table Data
    //--------------------------------------------------

    const columns = [

        {
            text: "Present Days",
            width: 120,
            align: "center"
        },

        {
            text: "Absent Days",
            width: 120,
            align: "center"
        },

        {
            text: "Leave Days",
            width: 120,
            align: "center"
        },

        {
            text: "Overtime Hrs",
            width: 120,
            align: "center"
        }

    ];

    const rows = [

        [

            {
                text: String(employee.PresentDays || 0),
                width: 120,
                align: "center"
            },

            {
                text: String(employee.AbsentDays || 0),
                width: 120,
                align: "center"
            },

            {
                text: String(employee.LeaveDays || 0),
                width: 120,
                align: "center"
            },

            {
                text: Number(employee.OvertimeHours || 0).toFixed(2),
                width: 120,
                align: "center"
            }

        ]

    ];

    //--------------------------------------------------
    // Draw Table
    //--------------------------------------------------

    this.drawTable(
        40,
        this.currentY,
        columns,
        rows
    );

    //--------------------------------------------------
    // Move Cursor
    //--------------------------------------------------

    this.currentY += 45;

}

/**
 * Draw Company Seal & Authorized Signatory
 */
 drawCompanySeal() {

    const doc = this.doc;

    const startX = 330;

    const startY = this.currentY;

    const sealPath = path.join(
        __dirname,
        "../assets/company_seal.png"
    );

    //---------------------------------------------------
    // Company Seal
    //---------------------------------------------------

    if (fs.existsSync(sealPath)) {

        doc.image(

            sealPath,

            startX + 20,

            startY,

            {

                fit: [80, 80]

            }

        );

    }
    else {

        doc

            .circle(
                startX + 60,
                startY + 40,
                35
            )

            .dash(2)

            .stroke("#888888")

            .undash();

        doc

            .fontSize(8)

            .fillColor("gray")

            .text(

                "Company Seal",

                startX + 20,

                startY + 90,

                {

                    width: 90,

                    align: "center"

                }

            );

    }

    //---------------------------------------------------
    // Signature Line
    //---------------------------------------------------

    doc

        .moveTo(
            startX,
            startY + 100
        )

        .lineTo(
            startX + 150,
            startY + 100
        )

        .stroke("#444444");

    //---------------------------------------------------
    // Authorized Signatory
    //---------------------------------------------------

    doc

        .font("Helvetica-Bold")

        .fontSize(10)

        .fillColor("black")

        .text(

            "Authorized Signatory",

            startX + 8,

            startY + 108

        );

    //---------------------------------------------------
    // Company Name
    //---------------------------------------------------

    doc

        .font("Helvetica")

        .fontSize(9)

        .fillColor("#555555")

        .text(

            this.company.CompanyName,

            startX,

            startY + 125,

            {

                width: 150,

                align: "center"

            }

        );

    this.currentY += 170;

}
/**
 * Draw HR Digital Signature
 */
 drawSignature() {

    this.checkPageBreak(140);

    const doc = this.doc;

    const startX = 40;
    const startY = this.currentY;

    const signaturePath = path.join(
        __dirname,
        "../assets/signature.png"
    );

    //---------------------------------------------------
    // Signature Image
    //---------------------------------------------------

    if (fs.existsSync(signaturePath)) {

        doc.image(
            signaturePath,
            startX + 20,
            startY,
            {
                fit: [120, 60]
            }
        );

    }
    else {

        doc

            .rect(
                startX + 20,
                startY,
                120,
                60
            )

            .dash(2)

            .stroke("#999999")

            .undash();

        doc

            .fontSize(9)

            .fillColor("gray")

            .text(
                "Signature",
                startX + 45,
                startY + 25
            );

    }

    //---------------------------------------------------
    // Signature Line
    //---------------------------------------------------

    doc

        .moveTo(
            startX + 10,
            startY + 75
        )

        .lineTo(
            startX + 150,
            startY + 75
        )

        .stroke("#444444");

    //---------------------------------------------------
    // Designation
    //---------------------------------------------------

    doc

        .font("Helvetica-Bold")

        .fontSize(10)

        .fillColor("black")

        .text(

            "HR Manager",

            startX + 35,

            startY + 82

        );

}

    checkPageBreak(requiredHeight = 50) {

        const bottomMargin = 90;
    
        if (this.currentY + requiredHeight >= this.pageHeight - bottomMargin) {
    
            this.doc.addPage();
    
            this.drawHeader();
    
            this.drawWatermark();
    
            this.currentY = 110;
    
        }
    
    }
    drawKeyValue(label, value, x, y, width = 220) {

        const doc = this.doc;
    
        doc
    
            .font("Helvetica-Bold")
    
            .fontSize(10)
    
            .fillColor("#333333")
    
            .text(label, x, y, {
                width: 95
            });
    
        doc
    
            .font("Helvetica")
    
            .fillColor("#000000")
    
            .text(
                value ?? "-",
                x + 95,
                y,
                {
                    width: width - 95
                }
            );
    
    }
    drawRow(startX, y, cells, isHeader = false) {

        const doc = this.doc;
    
        let x = startX;
    
        const rowHeight = 28;
    
        cells.forEach(cell => {
    
            const width = cell.width || 100;
    
            //---------------------------------------
            // Background
            //---------------------------------------
    
            if (isHeader) {
    
                doc
    
                    .rect(
                        x,
                        y,
                        width,
                        rowHeight
                    )
    
                    .fill(this.primaryColor);
    
                doc.fillColor("white");
    
                doc.font("Helvetica-Bold");
    
            }
            else {
    
                doc
    
                    .rect(
                        x,
                        y,
                        width,
                        rowHeight
                    )
    
                    .fill("#FFFFFF");
    
                doc.fillColor("black");
    
                doc.font("Helvetica");
    
            }
    
            //---------------------------------------
            // Border
            //---------------------------------------
    
            doc
    
                .lineWidth(0.7)
    
                .strokeColor("#D0D0D0")
    
                .rect(
                    x,
                    y,
                    width,
                    rowHeight
                )
    
                .stroke();
    
            //---------------------------------------
            // Alignment
            //---------------------------------------
    
            let align = "left";
    
            if (cell.align)
                align = cell.align;
    
            //---------------------------------------
            // Text
            //---------------------------------------
    
            doc
    
                .fontSize(10)
    
                .text(
    
                    cell.text,
    
                    x + 5,
    
                    y + 8,
    
                    {
    
                        width: width - 10,
    
                        align: align
    
                    }
    
                );
    
            x += width;
    
        });
    
    }
    drawTable(startX, startY, columns, rows) {

        this.currentY = startY;
    
        // Draw Header
        this.drawRow(
            startX,
            this.currentY,
            columns,
            true
        );
    
        this.currentY += 30;
    
        // Draw Data Rows
    
        rows.forEach(row => {
    
            this.drawRow(
                startX,
                this.currentY,
                row,
                false
            );
    
            this.currentY += 28;
    
        });
    
    }
    formatCurrency(amount) {

        amount = Number(amount || 0);
    
        return amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    
    }
    drawEarningsDeductions(employee) {

        this.checkPageBreak(280);
    
        this.sectionTitle("EARNINGS & DEDUCTIONS", this.currentY);
    
        this.currentY += 30;
    
        const doc = this.doc;
    
        const startX = 40;
        const tableWidth = 515;
        const rowHeight = 28;
    
        const earnings = [
    
            ["Basic Salary", employee.BasicSalary],
            ["House Rent Allowance", employee.HRA],
            ["Medical Allowance", employee.MedicalAllowance],
            ["Travel Allowance", employee.TravelAllowance],
            ["Overtime", employee.OvertimeAmount || 0],
            ["Bonus", employee.Bonus || 0]
    
        ];
    
        const deductions = [
    
            ["Leave Deduction", employee.LeaveDeduction],
            ["Provident Fund (PF)", employee.PF],
            ["Professional Tax", employee.ProfessionalTax],
            ["Income Tax (TDS)", employee.IncomeTax],
            ["Other Deduction", employee.OtherDeduction],
            ["", ""]
    
        ];
    
        const totalEarnings =
            Number(employee.BasicSalary || 0) +
            Number(employee.HRA || 0) +
            Number(employee.MedicalAllowance || 0) +
            Number(employee.TravelAllowance || 0) +
            Number(employee.OvertimeAmount || 0) +
            Number(employee.Bonus || 0);
    
        const totalDeductions =
            Number(employee.LeaveDeduction || 0) +
            Number(employee.PF || 0) +
            Number(employee.ProfessionalTax || 0) +
            Number(employee.IncomeTax || 0) +
            Number(employee.OtherDeduction || 0);
    
        //------------------------------------------------------
        // Header
        //------------------------------------------------------
    
        this.drawTable(
    
            startX,
    
            this.currentY,
    
            [
    
                { text: "Earnings", width: 200, align: "left" },
                { text: "Amount (₹)", width: 70, align: "right" },
                { text: "Deductions", width: 175, align: "left" },
                { text: "Amount (₹)", width: 70, align: "right" }
    
            ],
    
            []
    
        );
    
        this.currentY += 30;
    
        //------------------------------------------------------
        // Rows
        //------------------------------------------------------
    
        for (let i = 0; i < earnings.length; i++) {
    
            this.drawRow(
    
                startX,
    
                this.currentY,
    
                [
    
                    {
                        text: earnings[i][0],
                        width: 200
                    },
    
                    {
                        text: this.formatCurrency(earnings[i][1]),
                        width: 70,
                        align: "right"
                    },
    
                    {
                        text: deductions[i][0],
                        width: 175
                    },
    
                    {
                        text: deductions[i][1] === ""
                            ? ""
                            : this.formatCurrency(deductions[i][1]),
                        width: 70,
                        align: "right"
                    }
    
                ]
    
            );
    
            this.currentY += rowHeight;
    
        }
    
        //------------------------------------------------------
        // Total Row
        //------------------------------------------------------
    
        doc.font("Helvetica-Bold");
    
        this.drawRow(
    
            startX,
    
            this.currentY,
    
            [
    
                {
                    text: "Total Earnings",
                    width: 200
                },
    
                {
                    text: this.formatCurrency(totalEarnings),
                    width: 70,
                    align: "right"
                },
    
                {
                    text: "Total Deductions",
                    width: 175
                },
    
                {
                    text: this.formatCurrency(totalDeductions),
                    width: 70,
                    align: "right"
                }
    
            ]
    
        );
    
        doc.font("Helvetica");
    
        this.currentY += 45;
    
    }

    drawNetSalary(employee) {

        this.checkPageBreak(80);
    
        const doc = this.doc;
    
        const startX = 40;
    
        const width = 515;
    
        const height = 60;
    
        const netSalary =
    
            Number(employee.NetSalary || 0);
    
        //-------------------------------------------------
    
        doc
    
            .roundedRect(
    
                startX,
    
                this.currentY,
    
                width,
    
                height,
    
                4
    
            )
    
            .fill("#D1F2D9")
    
            .stroke("#198754");
    
        //-------------------------------------------------
    
        doc
    
            .fillColor("#155724")
    
            .fontSize(16)
    
            .font("Helvetica-Bold")
    
            .text(
    
                "NET SALARY PAYABLE",
    
                startX + 20,
    
                this.currentY + 12
    
            );
    
        //-------------------------------------------------
    
        doc
    
            .fontSize(20)
    
            .text(
    
                "₹ " +
    
                this.formatCurrency(netSalary),
    
                360,
    
                this.currentY + 15,
    
                {
    
                    width: 150,
    
                    align: "right"
    
                }
    
            );
    
        //-------------------------------------------------
    
        doc
    
            .fillColor("black")
    
            .font("Helvetica");
    
        this.currentY += 80;
    
    }

  /**
 * Draw Payment Details Section
 */
drawPaymentDetails(employee) {

    this.checkPageBreak(150);

    this.sectionTitle("PAYMENT DETAILS", this.currentY);

    this.currentY += 30;

    const doc = this.doc;

    const startX = 40;
    const width = 515;
    const height = 100;

    this.drawBox(startX, this.currentY, width, height);

    const leftX = startX + 15;
    const rightX = startX + 280;

    const paymentDate = employee.PaymentDate
        ? new Date(employee.PaymentDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
        : "-";

    this.drawKeyValue(
        "Payment Date",
        paymentDate,
        leftX,
        this.currentY + 15
    );

    this.drawKeyValue(
        "Payment Mode",
        employee.PaymentMode || "-",
        leftX,
        this.currentY + 40
    );

    this.drawKeyValue(
        "Transaction No",
        employee.TransactionNo || "-",
        leftX,
        this.currentY + 65
    );

    this.drawKeyValue(
        "Salary Status",
        employee.PaymentStatus || "Pending",
        rightX,
        this.currentY + 15
    );

    this.drawKeyValue(
        "Payroll Month",
        employee.PayrollMonth + " - " + employee.PayrollYear,
        rightX,
        this.currentY + 40
    );

    this.drawKeyValue(
        "Employee Code",
        employee.EmployeeCode,
        rightX,
        this.currentY + 65
    );

    this.currentY += height + 20;

}
/**
 * Draw Declaration Section
 */
 drawDeclaration() {

    this.checkPageBreak(90);

    this.sectionTitle("DECLARATION", this.currentY);

    this.currentY += 25;

    const doc = this.doc;

    const boxHeight = 70;

    this.drawBox(
        40,
        this.currentY,
        515,
        boxHeight
    );

    doc

        .font("Helvetica")

        .fontSize(10)

        .fillColor("#444444")

        .text(

            "This is a computer-generated salary slip and does not require a physical signature when digitally signed.",

            55,

            this.currentY + 15,

            {

                width: 490,

                align: "justify"

            }

        );

    doc

        .moveTo(55, this.currentY + 48)

        .lineTo(540, this.currentY + 48)

        .strokeColor("#DDDDDD")

        .stroke();

    doc

        .font("Helvetica-Oblique")

        .fontSize(9)

        .fillColor("gray")

        .text(

            "For any payroll discrepancy, please contact the HR or Payroll Department within 7 working days.",

            55,

            this.currentY + 53,

            {

                width: 490

            }

        );

    doc.fillColor("black");

    this.currentY += boxHeight + 25;

}
  /**
 * Draw QR Code Section
 * @param {String} qrImagePath
 * @param {String} verificationUrl (Optional)
 */
drawQRCode(qrImagePath, verificationUrl = "") {

    this.checkPageBreak(170);

    const doc = this.doc;

    this.sectionTitle("QR VERIFICATION", this.currentY);

    this.currentY += 25;

    const startX = 40;
    const startY = this.currentY;
    const boxWidth = 515;
    const boxHeight = 130;

    // Outer Box
    this.drawBox(startX, startY, boxWidth, boxHeight);

    //-------------------------------------------------------
    // Left Side Text
    //-------------------------------------------------------

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#000")
        .text(
            "Scan to Verify Salary Slip",
            startX + 20,
            startY + 15
        );

    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#555")
        .text(
            "Use any QR Scanner to verify this salary slip online.",
            startX + 20,
            startY + 38,
            {
                width: 260
            }
        );

    //-------------------------------------------------------
    // Verification URL
    //-------------------------------------------------------

    if (verificationUrl) {

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor("#0066CC")
            .text(
                verificationUrl,
                startX + 20,
                startY + 70,
                {
                    width: 280
                }
            );

    }

    //-------------------------------------------------------
    // QR Image
    //-------------------------------------------------------

    if (qrImagePath && fs.existsSync(qrImagePath)) {

        doc.image(

            qrImagePath,

            startX + 360,

            startY + 15,

            {

                fit: [100, 100],

                align: "center",

                valign: "center"

            }

        );

    }
    else {

        doc

            .rect(
                startX + 360,
                startY + 15,
                100,
                100
            )

            .stroke("#CCCCCC");

        doc

            .fontSize(9)

            .fillColor("red")

            .text(

                "QR Code\nNot Available",

                startX + 370,

                startY + 48,

                {

                    width: 80,

                    align: "center"

                }

            );

    }

    //-------------------------------------------------------
    // Bottom Note
    //-------------------------------------------------------

    doc

        .font("Helvetica-Oblique")

        .fontSize(8)

        .fillColor("gray")

        .text(

            "Verification confirms this salary slip was generated by the HRMS Payroll System.",

            startX + 20,

            startY + 105,

            {

                width: 320

            }

        );

    doc.fillColor("black");

    this.currentY += boxHeight + 20;

}

    drawEmployeeInfo(employee) {

        const doc = this.doc;
    
        this.checkPageBreak(170);
    

        this.sectionTitle("EMPLOYEE INFORMATION", this.currentY);
    
        this.currentY += 28;
    
        //-----------------------------------------------------
        // Outer Box
        //-----------------------------------------------------
    
        this.drawBox(
            40,
            this.currentY,
            515,
            130
        );
    
        const leftX = 55;
        const rightX = 310;
    
        let rowY = this.currentY + 15;
    
        //-----------------------------------------------------
        // Left Column
        //-----------------------------------------------------
        const joiningDate = employee.JoiningDate
    ? moment(employee.JoiningDate).format("DD-MMM-YYYY")
    : "-";

   this.drawKeyValue(
    "Joining Date",
    joiningDate,
    leftX,
    rowY + 88
);

        this.drawKeyValue(
            "Employee Code",
            employee.EmployeeCode,
            leftX,
            rowY
        );
    
        this.drawKeyValue(
            "Employee Name",
            employee.FirstName + " " + employee.LastName,
            leftX,
            rowY + 22
        );
    
        this.drawKeyValue(
            "Department",
            employee.DepartmentName,
            leftX,
            rowY + 44
        );
    
        this.drawKeyValue(
            "Designation",
            employee.Designation,
            leftX,
            rowY + 66
        );
    
       
    
        //-----------------------------------------------------
        // Right Column
        //-----------------------------------------------------
    
        this.drawKeyValue(
            "Bank",
            employee.BankName,
            rightX,
            rowY
        );
    
        this.drawKeyValue(
            "Account No",
            employee.AccountNumber,
            rightX,
            rowY + 22
        );
    
        this.drawKeyValue(
            "IFSC",
            employee.IFSCCode,
            rightX,
            rowY + 44
        );
    
        this.drawKeyValue(
            "PAN",
            employee.PANNo,
            rightX,
            rowY + 66
        );
    
        this.drawKeyValue(
            "UAN",
            employee.UANNo,
            rightX,
            rowY + 88
        );
    
        //-----------------------------------------------------
        // Vertical Divider
        //-----------------------------------------------------
    
        doc
    
            .moveTo(290, this.currentY)
    
            .lineTo(290, this.currentY + 130)
    
            .strokeColor("#DDDDDD")
    
            .stroke();
    
        this.currentY += 150;


        this.drawTable(

            40,
        
            this.currentY,
        
            [
        
                {
                    text: "Present",
                    width: 100,
                    align: "center"
                },
        
                {
                    text: "Absent",
                    width: 100,
                    align: "center"
                },
        
                {
                    text: "Leave",
                    width: 100,
                    align: "center"
                },
        
                {
                    text: "Overtime",
                    width: 100,
                    align: "center"
                }
        
            ],
        
            [
        
                [
        
                    {
                        text: employee.PresentDays.toString(),
                        width: 100,
                        align: "center"
                    },
        
                    {
                        text: employee.AbsentDays.toString(),
                        width: 100,
                        align: "center"
                    },
        
                    {
                        text: employee.LeaveDays.toString(),
                        width: 100,
                        align: "center"
                    },
        
                    {
                        text: employee.OvertimeHours.toString(),
                        width: 100,
                        align: "center"
                    }
        
                ]
        
            ]
        
        )
    
    }
    drawHeader() {

        const doc = this.doc;
    
        const logo = path.join(__dirname, "../assets/DhandaiLogo.png");
    
        // Blue Header Background
        doc
            .rect(0, 0, this.pageWidth, 90)
            .fill(this.primaryColor);
    
        if (fs.existsSync(logo)) {
    
            doc.image(
                logo,
                35,
                15,
                {
                    width: 55
                }
            );
    
        }
    
        doc
    
            .fillColor("white")
            .fontSize(22)
            .font("Helvetica-Bold")
            .text(
                this.company.CompanyName,
                110,
                18
            );
    
        doc
    
            .fontSize(10)
    
            .font("Helvetica")
    
            .text(
                this.company.Address1,
                110,
                45
            );
    
        doc.text(
            this.company.City +
            ", " +
            this.company.StateName,
            110,
            60
        );
    
        doc
    
            .fontSize(18)
    
            .font("Helvetica-Bold")
    
            .text(
                "SALARY SLIP",
                430,
                30
            );
    
        doc.fillColor("black");
    
    }
    drawWatermark() {

        const doc = this.doc;
    
        doc.save();
    
        doc.rotate(-35, {
    
            origin: [
    
                this.pageWidth / 2,
    
                this.pageHeight / 2
    
            ]
    
        });
    
        doc
    
            .fontSize(60)
    
            .fillColor("#D9D9D9")
    
            .opacity(0.18)
    
            .text(
    
                this.company.WatermarkText,
    
                70,
    
                350,
    
                {
    
                    align: "center"
    
                }
    
            );
    
        doc.restore();
    
        doc.opacity(1);
    
        doc.fillColor("black");
    
    }
    drawFooter() {

        const doc = this.doc;
    
        const y = this.pageHeight - 70;
    
        doc
    
            .rect(
    
                0,
    
                y,
    
                this.pageWidth,
    
                70
    
            )
    
            .fill(this.primaryColor);
    
        doc
    
            .fillColor("white")
    
            .fontSize(10)
    
            .text(
    
                this.company.CompanyName,
    
                40,
    
                y + 15
    
            );
    
        doc.text(
    
            this.company.PhoneNo,
    
            40,
    
            y + 30
    
        );
    
        doc.text(
    
            this.company.Email,
    
            220,
    
            y + 30
    
        );
    
        doc.text(
    
            this.company.Website,
    
            400,
    
            y + 30
    
        );
    
        doc.fillColor("black");
    
    }

    addPageNumbers() {

        const pages = this.doc.bufferedPageRange();
    
        for (let i = 0; i < pages.count; i++) {
    
            this.doc.switchToPage(i);
    
            this.doc
    
                .fontSize(9)
    
                .fillColor("gray")
    
                .text(
    
                    `Page ${i + 1} of ${pages.count}`,
    
                    470,
    
                    805
    
                );
    
        }
    
    }
    sectionTitle(title, y) {

        this.doc
    
            .fillColor(this.primaryColor)
    
            .fontSize(14)
    
            .font("Helvetica-Bold")
    
            .text(
    
                title,
    
                40,
    
                y
    
            );
    
        this.doc
    
            .moveTo(40, y + 18)
    
            .lineTo(555, y + 18)
    
            .strokeColor(this.primaryColor)
    
            .lineWidth(1)
    
            .stroke();
    
        this.doc.fillColor("black");
    
    }
    drawBox(x, y, w, h) {

        this.doc
    
            .roundedRect(
    
                x,
    
                y,
    
                w,
    
                h,
    
                3
    
            )
    
            .lineWidth(0.8)
    
            .stroke("#C8C8C8");
    
    }

    save(filePath) {

        return new Promise((resolve) => {
    
            const stream = fs.createWriteStream(filePath);
    
            this.doc.pipe(stream);
    
            this.doc.end();
    
            stream.on("finish", () => {
    
                resolve(filePath);
    
            });
    
        });
    
    }
}
module.exports = SalarySlipPDF;