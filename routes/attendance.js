const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: "Attendance List"
    });
});

router.post('/', (req, res) => {
    res.json({
        message: "Attendance Saved"
    });
});

module.exports = router;