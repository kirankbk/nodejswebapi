
/******************************************************************
 * Employee Validation Middleware
 ******************************************************************/

 module.exports = (req, res, next) => {

    const {

        FirstName,

        LastName,

        Mobile,

        DepartmentID,

        DesignationID,

        Username,

        Password

    } = req.body;

    if (!FirstName)

        return res.status(400).json({

            success: false,

            message: "First Name is required."

        });

    if (!LastName)

        return res.status(400).json({

            success: false,

            message: "Last Name is required."

        });

    if (!Mobile)

        return res.status(400).json({

            success: false,

            message: "Mobile Number is required."

        });

    if (!DepartmentID)

        return res.status(400).json({

            success: false,

            message: "Department is required."

        });

    if (!DesignationID)

        return res.status(400).json({

            success: false,

            message: "Designation is required."

        });

    // Password required only when creating a new employee
    if (req.method === "POST") {

        if (!Username)

            return res.status(400).json({

                success: false,

                message: "Username is required."

            });

        if (!Password)

            return res.status(400).json({

                success: false,

                message: "Password is required."

            });

    }

    next();

};