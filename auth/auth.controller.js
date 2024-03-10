const User = require('../user/user.model');
const Admin = require('../admin/admin.model');

const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let user;
    User.findOne({email: email})
        .then(foundUser => {
            if (!foundUser) {
                const error = new Error('A user with that email/password was not found.');
                error.statusCode = 404;
                return next(error)
            };
            user = foundUser;
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        const error = new Error('A user with that email/password was not found.');
                        error.statusCode = 404;
                        return next(error)
                    };
                    user.apiKey = crypto.randomBytes(32).toString('hex');
                    const expiration = Date.now() + (1000 * 60 * 60 * 8);
                    user.apiExp = new Date(expiration);
                    return user.save()
                        .then(updatedUser => {
                            res.status(200).json({message: 'Login successful.', data: updatedUser})
                        })
                })
        })
        .catch(error => {
            error.statusCode = 500;
            next(error)
        })
}

exports.authenticateUser = (req, res, next) => {
    const api = req.headers['apiKey'];
    if (!api) {
        const error = new Error(`Your request did not include an API key, please log in and try again.`);
        error.statusCode = 401;
        return next(error)
    };
    User.findOne({apiKey: api})
        .then(user => {
            if (!user || user.apiExp.getTime() < Date.now()) {
                const error = new Error('Your user API is invalid, please log in and try again.');
                error.statusCode = 401;
                return next(error)
            };
            req.body.userId = user._id;
            next()
        })
        .catch(error => {
            error.statusCode = 500;
            next(error)
        })
}

exports.authenticateAdmin = (req, res, next) => {
    const api = req.headers['apiKey'];
    if (!api) {
        const error = new Error(`Your request did not include an API key, please log in and try again.`);
        error.statusCode = 401;
        return next(error)
    };
    Admin.findOne({apiKey: api})
        .then(admin => {
            if (!admin || admin.apiExp.getTime() < Date.now()) {
                const error = new Error('Your user API is invalid, please log in and try again.');
                error.statusCode = 401;
                return next(error)
            };
            req.body.adminId = admin._id;
            next()
        })
        .catch(error => {
            error.statusCode = 500;
            next(error)
        })
}

exports.logout = (req, res, next) => {
    const userId = req.body.userId;
    User.findById(userId)
        .then(user => {
            user.apiKey = null;
            user.apiExp = null;
            return user.save()
                .then(updatedUser => {
                    res.status(200).json({message: 'Logout successful.'})
                })
        })
        .catch(error => {
            error.statusCode = 500;
            next(error)
        })
}