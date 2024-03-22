const express = require('express');

const router = express.Router();

const authController = require('../auth/auth.controller');
const projectController = require('./project-lifecycle.controller');

router.post('/createPrototype', authController.authenticateAdmin, projectController.createPrototype);

router.post('/createProject', authController.authenticateUser, projectController.createProject);

router.post('/addNote', authController.authenticateUser, projectController.addNoteToProject);

router.post('/delete', authController.authenticateAdmin, projectController.deleteProject);

module.exports = router