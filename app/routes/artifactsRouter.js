const express = require('express');
const router = express.Router();

 const artifactController = require('../controller/artifactsMapper');

// 검진자 필터링된 리스스
router.post('/list',   artifactController.listArtifacts);
router.post('/insert', artifactController.insertArtifacts);
router.post('/update', artifactController.updateArtifacts);
router.post('/delete', artifactController.deleteArtifacts);
module.exports = router;