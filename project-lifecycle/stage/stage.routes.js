const express = require('express');

const router = express.Router();

const authController = require('../../auth/auth.controller');
const stageController = require('./stage.controller');

router.post('/createPrototype', authController.authenticateAdmin, stageController.createPrototype);

router.post('/deleteStage', authController.authenticateAdmin, stageController.deleteStage);

router.post('/claimStage', authController.authenticateUser, stageController.claimStage);

router.post('/completeStage', authController.authenticateUser, stageController.completeStage);

module.exports = router