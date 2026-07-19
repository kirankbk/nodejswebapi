const { connectDB, sql } = require("../config/db");

const bcrypt = require("bcrypt");
// =======================
// GetEmployeesCode
// =======================
exports.getNextEmployeeCode = async (req, res) => {

    try {

         const pool = await connectDB();

        const result = await pool.request().query(`

SELECT TOP 1 EmployeeCode

FROM Employees

ORDER BY EmployeeID DESC

`);

        let next = 1;

        if (result.recordset.length > 0) {

            const lastCode =
                result.recordset[0].EmployeeCode;

            next =
                parseInt(

                    lastCode.replace("EMP", "")

                ) + 1;

        }

        res.json({

            employeeCode:

                "EMP" +

                next

                    .toString()

                    .padStart(4, "0")

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

// =======================
// Get All Employees
// =======================
exports.getEmployees = async (req, res) => {
    try {
        const pool = await connectDB();
        console.log("Before+poll"+pool);
       console.log("Before getemp");
        const result = await pool.request().query(`
        SELECT
        EmployeeID,
        EmployeeCode,
        FirstName,
        LastName,
        Gender,
        Address,
        Mobile,
        Email,
        Designation,              
        JoiningDate,
        DailySalary,
        MonthlySalary,
        d.DepartmentName
    FROM Employees e inner join Departments D
    ON e.DepartmentID=D.DepartmentID
    ORDER BY EmployeeID DESC
        `);
        console.log("afer getemp"+result.recordset);
        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// =======================
// Get Employee By ID
// =======================
exports.getEmployeeById = async (req, res) => {

    try {

        const pool = await connectDB();
        console.log("Before+poll"+pool);
        console.log("Before getempid");
        const result = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query("SELECT  EmployeeID,  EmployeeCode, FirstName, LastName, Gender, Address, Mobile, Email,  Designation, JoiningDate,  DailySalary,MonthlySalary,d.DepartmentName  FROM Employees e inner join Departments D ON e.DepartmentID=D.DepartmentID WHERE e.EmployeeID=@id");
            console.log("after+poll"+result.recordset);
            console.log("after getempid");
        if (result.recordset.length === 0)
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });

        res.json(result.recordset[0]);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
//uploadProfile
exports.uploadProfile = (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
  
      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  


// =======================
// Create Employee
// =======================
exports.CreateEmployee = async (req, res) => {

    try {

                /******************************************************
         * Employee Information
         ******************************************************/
   /******************************************************
         * Uploaded Employee Photo
         ******************************************************/

    let photoPath = null;

    if (req.file) {

        photoPath = path.join(

            "uploads",

            "employees",

            req.file.filename

        ).replace(/\\/g, "/");

    }
                 const {

                    EmployeeCode,
        
                    FirstName,
                    LastName,
                    Gender,
                    DOB,
        
                    Mobile,
                    Email,
        
                    AadharNo,
                    PANNo,
        
                    DepartmentID,
                    DesignationID,
        
                    JoiningDate,
                   
        
                    BasicSalary,
                    HRA,
                    MedicalAllowance,
                    TravelAllowance,
                    OtherAllowance,
                  
                    MonthlySalary,
        
                 
                    ESIC,
                 
        
                    BankName,
                 
                    AccountNumber,
                    IFSCCode,
                    BranchName,
                         
                  
                  
        
                } = req.body;
       
        /*********************************************************************
 * Hash Password
 *********************************************************************/

//const hashedPassword = await bcrypt.hash(Password, 10);

/*********************************************************************
 * Insert Employee
 *********************************************************************/

 const pool = await connectDB();

 const result=await pool.request()
    .input("EmployeeCode", sql.VarChar(20), EmployeeCode)
    .input("FirstName", sql.NVarChar(100), FirstName)
    .input("LastName", sql.NVarChar(100), LastName)
    .input("Gender", sql.VarChar(20), Gender)
    .input("DOB", sql.Date, DOB)
    .input("Mobile", sql.VarChar(15), Mobile)
    .input("Email", sql.VarChar(150), Email)
    .input("AadharNo", sql.VarChar(20), AadharNo)
    .input("PANNo", sql.VarChar(20), PANNo)
    .input("DepartmentID", sql.Int, DepartmentID)
    .input("Designation", sql.Int, DesignationID)
    .input("JoiningDate", sql.Date, JoiningDate)
   
    .input("BasicSalary", sql.Decimal(18,2), BasicSalary)
    .input("HRA", sql.Decimal(18,2), HRA)
    .input("MedicalAllowance", sql.Decimal(18,2), MedicalAllowance)
    .input("TravelAllowance", sql.Decimal(18,2), TravelAllowance)
    .input("OtherAllowance", sql.Decimal(18,2), OtherAllowance)  
    .input("MonthlySalary", sql.Decimal(18,2), MonthlySalary)
  
    .input("ESICNumber", sql.Decimal(18,2), ESIC)

    .input("BankName", sql.NVarChar(150), BankName)
    .input("AccountNumber", sql.VarChar(50), AccountNumber)
    .input("IFSCCode", sql.VarChar(20), IFSCCode)
    .input("BranchName", sql.NVarChar(150), BranchName)
  
   
    .query(`
        INSERT INTO Employees
        (
            EmployeeCode,
            FirstName,
            LastName,
            Gender,
            DOB,
            Mobile,
            Email,
            AadharNo,
            PANNo,
            DepartmentID,
            Designation,
            JoiningDate,
          
          
            BasicSalary,
            HRA,
            MedicalAllowance,
            TravelAllowance,
            OtherAllowance,
           
         
            MonthlySalary,
         
            ESICNumber,
           
            BankName,
           
            AccountNumber,
            IFSCCode,
            BranchName
           
        )
        VALUES
        (
            @EmployeeCode,
            @FirstName,
            @LastName,
            @Gender,
            @DOB,
            @Mobile,
            @Email,
            @AadharNo,
            @PANNo,
            @DepartmentID,
            @Designation,
            @JoiningDate,
                      
            @BasicSalary,
            @HRA,
            @MedicalAllowance,
            @TravelAllowance,
            @OtherAllowance,
          
         
            @MonthlySalary,
       
            @ESICNumber,
            @BankName,
            @AccountNumber,
            @IFSCCode,
            @BranchName
                 
        );

        SELECT SCOPE_IDENTITY() AS EmployeeID;
    `);

     const employeeId = result.recordset?.[0]?.EmployeeID;
        // res.json({
        //     success: true,
        //     message: "Employee Added Successfully"
        // });
        console.log("result.recordset"+result.recordset?.[0]?.EmployeeID)
        console.log("result.recordsetlength"+result.recordset.length)
        if (result.recordset.length === 0)
            res.status(404).json({
            success: false,
            message: "Employee not found"
        });
    else{
        return res.status(201).json({
            success: true,
            message: "Employee created successfully.",
            employeeId: employeeId
        });
    }
    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// =======================
// Add Employee
// =======================
exports.addEmployee = async (req, res) => {

    try {

        const {
            employeeCode,
            firstName,
            lastName,
            gender,
            mobile,
            email,
            designation,
            departmentId,
            joiningDate,
            dailySalary,
            monthlySalary
        } = req.body;

        const pool = await connectDB();

        await pool.request()
            .input("employeeCode", sql.NVarChar, employeeCode)
            .input("firstName", sql.NVarChar, firstName)
            .input("lastName", sql.NVarChar, lastName)
            .input("gender", sql.NVarChar, gender)
            .input("mobile", sql.NVarChar, mobile)
            .input("email", sql.NVarChar, email)
            .input("designation", sql.NVarChar, designation)
            .input("departmentId", sql.Int, departmentId)
            .input("joiningDate", sql.Date, joiningDate)
            .input("dailySalary", sql.Decimal(10,2), dailySalary)
            .input("monthlySalary", sql.Decimal(10,2), monthlySalary)
            .query(`
                INSERT INTO Employees
                (
                    EmployeeCode,
                    FirstName,
                    LastName,
                    Gender,
                    Mobile,
                    Email,
                    Designation,
                    DepartmentID,
                    JoiningDate,
                    DailySalary,
                    MonthlySalary
                )
                VALUES
                (
                    @employeeCode,
                    @firstName,
                    @lastName,
                    @gender,
                    @mobile,
                    @email,
                    @designation,
                    @departmentId,
                    @joiningDate,
                    @dailySalary,
                    @monthlySalary
                )
            `);

        res.json({
            success: true,
            message: "Employee Added Successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// =======================
// Update Employee
// =======================
exports.updateEmployee = async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            gender,
            mobile,
            email,
            designation,
            departmentId,
            joiningDate,
            dailySalary,
            monthlySalary
        } = req.body;

        const pool = await connectDB();

        await pool.request()
            .input("id", sql.Int, req.params.id)
            .input("firstName", sql.NVarChar, firstName)
            .input("lastName", sql.NVarChar, lastName)
            .input("gender", sql.NVarChar, gender)
            .input("mobile", sql.NVarChar, mobile)
            .input("email", sql.NVarChar, email)
            .input("designation", sql.NVarChar, designation)
            .input("departmentId", sql.Int, departmentId)
            .input("joiningDate", sql.Date, joiningDate)
            .input("dailySalary", sql.Decimal(10,2), dailySalary)
            .input("monthlySalary", sql.Decimal(10,2), monthlySalary)
            .query(`
                UPDATE Employees
                SET
                    FirstName=@firstName,
                    LastName=@lastName,
                    Gender=@gender,
                    Mobile=@mobile,
                    Email=@email,
                    Designation=@designation,
                    DepartmentID=@departmentId,
                    JoiningDate=@joiningDate,
                    DailySalary=@dailySalary,
                    MonthlySalary=@monthlySalary
                WHERE EmployeeID=@id
            `);

        res.json({
            success: true,
            message: "Employee Updated Successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// =======================
// Delete Employee
// =======================
exports.deleteEmployee = async (req, res) => {

    try {

        const pool = await connectDB();

        await pool.request()
            .input("id", sql.Int, req.params.id)
            .query("DELETE FROM Employees WHERE EmployeeID=@id");

        res.json({
            success: true,
            message: "Employee Deleted Successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};