const Stage = require('./stage.model');
const Lifecycle = require('../project-lifecycle.model');

exports.createPrototype = (req, res, next) => {
    const title = req.body.title;
    const desc = req.body.desc;
    Stage.findOne({title: title, prototype: true})
        .then(stage => {
            if (stage) {
                const error = new Error('A prototype stage with that title already exists!');
                error.statusCode = 422;
                return next(error)
            };
            const newStage = new Stage({
                title: title,
                description: desc,
                prototype: true,
                status: 'Prototype'
            });
            newStage.save()
                .then(savedStage => {
                    res.status(201).json({message: 'Prototype stage created.'})
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

exports.deleteStage = (req, res, next) => {
    const stageId = req.body.stageId;
    Stage.findByIdAndDelete(stageId)
        .then(deletedStage => {
            if (!deletedStage) {
                const error = new Error('Prototype stage not found.');
                error.statusCode = 404;
                return next(error)
            };
            res.status(200).json({message: 'Prototype stage deleted.'})
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

exports.loadStagesToLifecycle = function (lifeCycleId, IdArray = []) {
    let lifecycle;
    Lifecycle.findById(lifeCycleId)
        .then(foundLifecycle => {
            if (!foundLifecycle || foundLifecycle.prototype) {
                throw new Error('Lifecycle not found or invalid.')
            }
            lifecycle = foundLifecycle;
            return Promise.all(IdArray.map(Id => {
                return Stage.findById(Id)
                    .then(foundStage => {
                        const newStage = new Stage({
                            title: foundStage.title,
                            description: foundStage.description,
                            prototype: false,
                            status: 'Not started'
                        });
                        return newStage.save()
                    })
                    .then(savedStage => {
                        lifecycle.stages.push(savedStage._id)
                    })
            }))
            .then(() => {
                lifecycle.save();
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.claimStage = (req, res, next) => {
    const userId = req.body.userId;
    const stageId = req.body.stageId;
    Stage.findById(stageid)
        .then(stage => {
            if (!stage || stage.prototype) {
                const error = new Error('Invalid stage.');
                error.statusCode = 422;
                return next(error)
            };
            stage.claimedBy = userId;
            stage.save()
                .then(savedStage => {
                    res.status(200).json({message: 'Stage claimed.', data: savedStage})
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}