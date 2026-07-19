require("dotenv").config();
const sql = require('mssql/msnodesqlv8');

const config = {
    user: 'db60344',          // your SQL username
    password: 'e#5GFb=9+B7i',  // your SQL password
    server: 'db60344.databaseasp.net', // MonsterASP SQL server name
    database: 'db60344',
    options: {
      encrypt: true,                 // required for secure connection
      trustServerCertificate: true   // allow self-signed certs
    }
  };

// const config = {
//     server: 'DESKTOP-AVNHU21\\SQLEXPRESS',
//     database: 'AttendanceDB1',
//     driver: 'msnodesqlv8',
//     options: {
//         trustedConnection: true,
//         trustServerCertificate: true
//     }
// };

async function connectDB() {
    try {
        const pool = await sql.connect(config);
        console.log("✅ Connected to SQL Server:", pool.server, pool.database);
        return pool; // return the pool object
    } catch (err) {
        console.error("❌ Database Connection Failed:", err);
        throw err;
    }
}

module.exports = {
    sql,
    connectDB
};
