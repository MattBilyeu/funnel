const Client = require('./client.model');
const Lifecycle = require('../project-lifecycle/project-lifecycle.model');

const { sendOne } = require('../util/emailer');

const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.createClient = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email.toLowerCase(); //Done to ensure emails are case insensitive.  Login attempts also do this to whatever email is entered.
    const password = req.body.password;
    const phone = req.body.phone;
    Client.findOne({email: email})
        .then(client => {
            if (client) {
                const error = new Error('A client with that email already exists.');
                error.statusCode = 422;
                return next(error)
            } else {
                bcrypt.hash(password, 12)
                    .then(hashedPassword => {
                        const newClient = new Client({
                            name: name,
                            email: email,
                            password: hashedPassword,
                            resetToken: null,
                            resetExpiration: null,
                            phone: phone
                        });
                        return newClient.save().then(newClient => {
                            return res.status(201).json({message: 'Client Created.', data: newClient})
                        })
                    })
                    .catch(err => {
                        const error = new Error('Internal server error.');
                        error.statusCode = 500;
                        return next(error)
                    })
            }
        })
        .catch(err => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error)
        })
}

exports.updateEmail = (req, res, next) => {
    const oldEmail = req.body.oldEmail;
    const newEmail = req.body.newEmail;
    const password = req.body.password;
    let foundClient;
    Client.findOne({email: oldEmail})
        .then(client => {
            if (!client || client._id.toString() !== req.session.clientId.toString()) {
                const error = new Error('Your email update attempt has failed, please try again.');
                error.statusCode = 401;
                return next(error);
            } else {
                foundClient = client;
                bcrypt.compare(password, client.password)
                    .then(doMatch => {
                        if (!doMatch) {
                            return res.status(422).json({message: 'The email and password combination you have submitted has not been found.'})
                        } else {
                            foundClient.email = newEmail;
                            return foundClient.save()
                                .then(updatedClient => {
                                    return res.status(200).json({message: 'Email updated.', data: updatedClient})
                                })
                                .catch(err => {
                                    const error = new Error(err);
                                    error.statusCode = 500;
                                    next(error)
                                })
                        }
                    })
            }
        })
        .catch(err => {
            err.statusCode = 500;
            return next(err);
        })
}

exports.sendPassUpdate = (req, res, next) => {
    const email = req.body.email;
    let foundClient;
    Client.findOne({email: email})
        .then(client => {
            if (!client || client.banned) {
                const error = new Error('That email is not valid.');
                error.statusCode = 401;
                return next(error);
            } else {
                foundClient = client;
                crypto.randomBytes(32, (err, buffer) => {
                    if (err) {
                        const error = new Error('Error creating reset token.');
                        error.statusCode = 500;
                        next(error)
                    };
                    const token = buffer.toString('hex');
                    foundClient.resetToken = token;
                    foundClient.tokenExpiration = Date.now() + (60 * 60 * 1000);
                    return foundClient.save()
                        .then(result => {
                            sendOne(email, 'Password Reset',
                            `
                                <h1>Password Reset</h1>
                                <p>You requested a password reset.</p>
                                <p>Click this <a href="https://study-stride.com/pass-reset/${token}">link</a> to set a new password.</p>
                            `
                        );
                        res.status(200).json({message: 'Password Reset Sent - Please check your email.'})
                        })
                        .catch(err => {
                            const error = new Error(err);
                            error.status(500);
                            next(error)
                        })
                })
            }
        })
        .catch(err => {
            err.statusCode = 500;
            return next(err);
        })
}

exports.updatePassword = (req, res, next) => {
    const token = req.body.token;
    const password = req.body.password;
    let foundClient;
    Client.findOne({resetToken: token})
        .then(client => {
            const tokenExpiration = new Date(client.resetTokenExpiration);
            if (!client || tokenExpiration.getTime() < Date.now()) { //Checks if the token is not found or if it is expired, does not update password if it is.
                return res.status(404).json({message: 'Your token is invalid.'})
            } else {
                foundClient = client;
                return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    foundClient.password = hashedPassword;
                    return foundClient.save()
                        .then(updatedClient => {
                            updatedClient.password = 'redacted';
                            return res.status(200).json({message: 'Password updated.', data: updatedClient})
                        })
                        .catch(err => {
                            const error = new Error(err);
                            error.statusCode = 500;
                            next(error)
                        })
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: 'Internal server error.'})
        })
}

exports.deleteClient = (req, res, next) => {
    const clientId = req.body.clientId
    Client.findByIdAndDelete(clientId)
        .then(deletedClient => {
            if (!deletedClient) {
                const error = new Error('Client not found.');
                error.statusCode = 404;
                return next(error);
            } else {
                if (deletedClient.lifecycles.length > 0) {
                    deletedClient.lifecycles.forEach(lifecycle => {
                        Lifecycle.findByIdAndDelete(lifecycle._id);
                    })
                }
                return res.status(200).json({message: 'Client deleted.', data: null})
            }
        })
        .catch(err => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error)
        })
}

exports.addProject = function(clientId, projectId) {
    return Client.findById(clientId)
        .then(client => {
            client.lifecycles.push(projectId);
            return client.save()
        })
        .catch(err => console.log(err))
}