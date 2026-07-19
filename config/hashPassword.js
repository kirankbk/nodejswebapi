const bcrypt = require("bcrypt");

(async () => {
    console.log(await bcrypt.hash("admin123", 10));
    console.log(await bcrypt.hash("emp123", 10));
})();