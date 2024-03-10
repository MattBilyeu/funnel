const express = require('express');

const router = express.Router();

const authController = require('../auth/auth.controller');
const teamController = require('./team.controller');

router.post('/create', authController.authenticateAdmin, teamController.create);

router.post('/addMembers', authController.authenticateAdmin, teamController.addMembers);

router.post('/removeMembers', authController.authenticateAdmin, teamController.removeMembers);

router.post('/assignStages', authController.authenticateAdmin, teamController.assignStages);

router.post('/removeStages', authController.authenticateAdmin, teamController.removeStages);

router.post('/delete', authController.authenticateAdmin, teamController.deleteTeam);

module.exports = router