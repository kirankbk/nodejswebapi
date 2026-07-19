const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: "Salary List"
    });
});

router.post('/', (req, res) => {
    res.json({
        message: "Salary Saved"
    });
});

module.exports = router;