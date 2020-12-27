const express = require('express');
const router = express.Router();

const mutationController = require('../controller/mutationMapper');

// 검진자 필터링된 리스스
router.post('/list',   mutationController.listMutation);
router.post('/insert', mutationController.insertMutation);
router.post('/update', mutationController.updateMutation);
router.post('/delete', mutationController.deleteMutation);
// 

module.exports = router;