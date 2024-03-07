const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');
const authController = require('../auth/auth.controller');

router.post('/create', authController.authenticateAdmin, userController.createUser);

router.post('/updateEmail', authController.authenticateUser, userController.updateEmail);

router.post('/sendPassUpdate', userController.sendPassUpdate);

router.post('/updatePassword', userController.updatePassword);

router.post('/deleteUser', authController.authenticateAdmin, userController.deleteUser);

module.exports = router;