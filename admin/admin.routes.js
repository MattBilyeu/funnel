const express = require('express');

const router = express.Router();

const adminController = require('./admin.controller');
const authController = require('../auth/auth.controller');

router.post('/create', authController.authenticateAdmin,adminController.createAdmin)

router.post('./updateEmail', authController.authenticateAdmin, adminController.updateEmail);

router.post('/sendPassUpdate', adminController.sendPassUpdate);

router.post('/updatePassword', adminController.updatePassword);

router.post('/delete', authController.authenticateAdmin, adminController.deleteAdmin);

module.exports = router;