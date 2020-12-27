const express = require('express');
const router = express.Router();

 const benignController = require('../controller/BenigneMapper');

// 검진자 필터링된 리스스
router.post('/list',   benignController.listBenign);
router.post('/insert', benignController.insertBenign);
router.post('/update', benignController.updateBenign);
router.post('/delete', benignController.deleteBenign);

module.exports = router;