const express = require('express');

const router = express.Router();

const clientController = require('./client.controller');
const authController = require('../auth/auth.controller');

router.post('/create', clientController.createClient);

// Initially will not have a client portal -> will check that a valid user is making these changes.  Other routes will eventually be used if a client portal is added.
router.post('/updateEmail', authController.authenticateUser, clientController.updateEmail);

router.post('/sendPassUpdate', clientController.sendPassUpdate);

router.post('/updatePassword', clientController.updatePassword);

router.post('/delete', authController.authenticateUser, clientController.deleteClient);

module.exports = router