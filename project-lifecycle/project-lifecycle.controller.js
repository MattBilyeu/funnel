const ProjectLifecycle = require('./project-lifecycle.model');
const { loadStagesToLifecycle } = require('./stage/stage.controller');

exports.createPrototype = (req, res, next) => {
    const stages = req.body.stages;
    const title = req.body.title;
    const desc = req.body.description;
    ProjectLifecycle.findOne({title: title})
        .then(lifecycle => {
            if (lifecycle) {
                const error = new Error('A lifecycle with that title already exists.');
                error.statusCode = 422;
                return next(error)
            };
            const newLifecycle = new ProjectLifecycle({
                title: title,
                description: desc,
                prototype: true
            });
            newLifecycle.save()
                .then(savedLifecycle => {
                    loadStagesToLifecycle(savedLifecycle._id, stages)   
                        .then(updatedLifecycle => {
                            res.status(201).json({message: 'Lifecycle created.', data: updatedLifecycle})
                        })
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}