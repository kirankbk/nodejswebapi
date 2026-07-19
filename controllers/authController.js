const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { connectDB, sql } = require("../config/db");

exports.login = async (req, res) => {

    try {

        const { username, password } = req.body;

        const pool = await connectDB();

        const result = await pool.request()
            .input("username", sql.NVarChar, username)
            .query(`
                SELECT
                    u.UserID,
                    u.Username,
                    u.Password,
                    r.RoleName
                FROM Users u
                INNER JOIN Roles r
                ON u.RoleID=r.RoleID
                WHERE u.Username=@username
                AND u.IsActive=1
            `);

        if (result.recordset[0].length === 0)
            return res.status(401).json({
                success: false,
                message: "Invalid Username"
            });

        const user = result.recordset[0];
       console.log(user);
       console.log(user.Password);
       console.log("before");
      // console.log("pass"+Password+""+result.recordset[0].length);
       // const valid = await bcrypt.compare(password, user.Password);
       if (user !=undefined) {
        console.log("Inside");
       // res.json({ success: true, user: result.recordset[0] });
        const token = jwt.sign(
            {
                userId: user.UserID,
                username: user.Username,
                role: user.RoleName
            },
            "AttendanceSystemSecret123",
            {
                expiresIn: "8h"
            }
        );
       console.log(token);
        res.json({
            success: true,
            token,
            user: {
                id: user.UserID,
                username: user.Username,
                role: user.RoleName
            }
        });

    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
        // if (!valid)
        //     return res.status(401).json({
        //         success: false,
        //         message: "Invalid Password"
        //     });

        

    } catch (err) {

        res.status(500).json(err);

    }

};

// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const { connectDB, sql } = require("../config/db");

// exports.login = async (req, res) => {

//     try {

//         const { username, password } = req.body;

//         const pool = await connectDB();

//         const result = await pool.request()
//             .input("username", sql.NVarChar, username)
//             .query(`
//                 SELECT
//                     u.UserID,
//                     u.Username,
//                     u.Password,
//                     r.RoleName
//                 FROM Users u
//                 INNER JOIN Roles r
//                 ON u.RoleID=r.RoleID
//                 WHERE u.Username=@username
//                 AND u.IsActive=1
//             `);

//         if (result.recordset.length === 0)
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid Username"
//             });

//         const user = result.recordset[0];
//        console.log(user);
//        console.log(user.Password);
//        console.log(password);
//         const valid = await bcrypt.compare(password, user.Password);
       
//         if (!valid)
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid Password"
//             });

//         const token = jwt.sign(
//             {
//                 userId: user.UserID,
//                 username: user.Username,
//                 role: user.RoleName
//             },
//             "AttendanceSystemSecret123",
//             {
//                 expiresIn: "8h"
//             }
//         );
//        console.log(token);
//         res.json({
//             success: true,
//             token,
//             user: {
//                 id: user.UserID,
//                 username: user.Username,
//                 role: user.RoleName
//             }
//         });

//     } catch (err) {

//         res.status(500).json(err);

//     }

// };