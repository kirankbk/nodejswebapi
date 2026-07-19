const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: "Employee List"
    });
});

router.post('/', (req, res) => {
    res.json({
        message: "Employee Added"
    });
});

module.exports = router;