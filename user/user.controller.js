const User = require('./user.model');

const { sendOne } = require('../util/emailer');

const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.createUser = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email.toLowerCase(); //Done to ensure emails are case insensitive.  Login attempts also do this to whatever email is entered.
    const password = req.body.password;
    User.findOne({email: email})
        .then(user => {
            if (user) {
                const error = new Error('A user with that email already exists.');
                error.statusCode = 422;
                return next(error);
            } else {
                bcrypt.hash(password, 12)
                    .then(hashedPassword => {
                        const newUser = new User({
                            name: name,
                            email: email,
                            password: hashedPassword,
                            resetToken: null,
                            resetExpiration: null,

                        });
                        newUser.save().then(newUser => {
                            return res.status(201).json({message: 'User Created.', user: newUser})
                        })
                    })
            }
        })
        .catch(err => {
            err.statusCode = 500;
            return next(err);
        })
}

exports.updateEmail = (req, res, next) => {
    const oldEmail = req.body.oldEmail;
    const newEmail = req.body.newEmail;
    const password = req.body.password;
    let foundUser;
    User.findOne({email: oldEmail})
        .then(user => {
            if (!user || user._id.toString() !== req.session.userId.toString()) {
                return res.status(422).json({message: 'Your email update attempt has failed, please try again.'})
            } else {
                foundUser = user;
                bcrypt.compare(password, user.password)
                    .then(doMatch => {
                        if (!doMatch) {
                            const error = new Error('The email and password combination you have submitted has not been found.');
                            error.statusCode = 422;
                            return next(error);
                        } else {
                            foundUser.email = newEmail;
                            foundUser.save()
                                .then(updatedUser => {
                                    return res.status(200).json({message: 'Email updated.', user: updatedUser})
                                })
                            }
                        })
            }
        })
        .catch(err => {
            err.statusCode = 500;
            return next(err)
        })
}

exports.sendPassUpdate = (req, res, next) => {
    const email = req.body.email;
    let foundUser;
    User.findOne({email: email})
        .then(user => {
            if (!user || user.banned) {
                const error = new Error('That email is not valid.');
                error.statusCode = 404;
                return next(error);
            } else {
                foundUser = user;
                crypto.randomBytes(32, (err, buffer) => {
                    if (err) {
                        err.statusCode = 500;
                        return next(err);
                    };
                    const token = buffer.toString('hex');
                    foundUser.resetToken = token;
                    foundUser.tokenExpiration = Date.now() + (60 * 60 * 1000);
                    foundUser.save()
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
                })
            }
        })
        .catch(err => {
            err.statusCode = 500;
            next(err);
        })
}

exports.updatePassword = (req, res, next) => {
    const token = req.body.token;
    const password = req.body.password;
    let foundUser;
    User.findOne({resetToken: token})
        .then(user => {
            const tokenExpiration = new Date(user.resetTokenExpiration);
            if (!user || tokenExpiration.getTime() < Date.now()) { //Checks if the token is not found or if it is expired, does not update password if it is.
                const error = new Error('Your token is invalid.');
                error.statusCode = 404;
                return next(error);
            } else {
                foundUser = user;
                return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    foundUser.password = hashedPassword;
                    foundUser.save()
                        .then(updatedUser => {
                            updatedUser.password = 'redacted';
                            return res.status(200).json({message: 'Password updated.', user: updatedUser})
                        })
                })
            }
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

exports.deleteUser = (req, res, next) => {
    const userId = req.body.userId
    User.findByIdAndDelete(userId)
        .then(deletedUser => {
            if (!deletedUser) {
                const error = new Error('User not found.');
                error.statusCode = 404;
                return next(error);
            } else {
                return res.status(200).json({message: 'User deleted.', user: null})
            }
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}