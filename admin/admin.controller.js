const Admin = require('./admin.model');

const { sendOne } = require('../util/emailer');

exports.createAdmin = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    Admin.findOne({email: email})
        .then(admin => {
            if (admin) {
                const error = new Error('An admin with that email already exists.');
                error.statusCode = 401;
                return next(error);
            };
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const newAdmin = new Admin({
                        name: name,
                        email: email,
                        password: hashedPassword
                    });
                    return newAdmin.save()
                        .then(savedAdmin => {
                            res.status(201).json({message: 'Admin created.'})
                        })
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
};

exports.updateEmail = (req, res, next) => {
    const oldEmail = req.body.oldEmail;
    const newEmail = req.body.newEmail;
    const password = req.body.password;
    let foundAdmin;
    Admin.findOne({email: oldEmail})
        .then(admin => {
            if (!admin || admin._id.toString() !== req.session.adminId.toString()) {
                return res.status(422).json({message: 'Your email update attempt has failed, please try again.'})
            } else {
                foundAdmin = admin;
                bcrypt.compare(password, admin.password)
                    .then(doMatch => {
                        if (!doMatch) {
                            return res.status(422).json({message: 'The email and password combination you have submitted has not been found.'})
                        } else {
                            foundAdmin.email = newEmail;
                            return foundAdmin.save()
                                .then(updatedAdmin => {
                                    return res.status(200).json({message: 'Email updated.', data: updatedAdmin})
                                })
                                .catch(err => {
                                    const error = new Error(err);
                                    error.status(500);
                                    next(error)
                                })
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({message: 'Internal server error.'})
                    })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: 'Internal server error.'})
        })
}

exports.sendPassUpdate = (req, res, next) => {
    const email = req.body.email;
    let foundAdmin;
    Admin.findOne({email: email})
        .then(admin => {
            if (!admin || admin.banned) {
                return res.status(404).json({message: 'That email is not valid.'})
            } else {
                foundAdmin = admin;
                crypto.randomBytes(32, (err, buffer) => {
                    if (err) {
                        console.log(err);
                        next(new Error('Error creating reset token.'))
                    };
                    const token = buffer.toString('hex');
                    foundAdmin.resetToken = token;
                    foundAdmin.tokenExpiration = Date.now() + (60 * 60 * 1000);
                    return foundAdmin.save()
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
            console.log(err);
            res.status(500).json({message: 'Internal server error.'})
        })
}

exports.updatePassword = (req, res, next) => {
    const token = req.body.token;
    const password = req.body.password;
    let foundAdmin;
    Admin.findOne({resetToken: token})
        .then(admin => {
            const tokenExpiration = new Date(admin.resetTokenExpiration);
            if (!admin || tokenExpiration.getTime() < Date.now()) { //Checks if the token is not found or if it is expired, does not update password if it is.
                return res.status(404).json({message: 'Your token is invalid.'})
            } else {
                foundAdmin = admin;
                return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    foundAdmin.password = hashedPassword;
                    return foundAdmin.save()
                        .then(updatedAdmin => {
                            updatedAdmin.password = 'redacted';
                            return res.status(200).json({message: 'Password updated.', data: updatedAdmin})
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
            console.log(err);
            res.status(500).json({message: 'Internal server error.'})
        })
}

exports.deleteAdmin = (req, res, next) => {
    const adminId = req.body.adminId
    Admin.findByIdAndDelete(adminId)
        .then(deletedAdmin => {
            if (!deletedAdmin) {
                return res.status(404).json({message: 'Admin not found.'})
            } else {
                return res.status(200).json({message: 'Admin deleted.', data: null})
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: 'Internal server error.'})
        })
}