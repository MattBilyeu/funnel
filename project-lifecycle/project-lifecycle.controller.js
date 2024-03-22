const ProjectLifecycle = require('./project-lifecycle.model');
const { loadStagesToLifecycle, deleteLifecycleStages } = require('./stage/stage.controller');
const { addProject } = require('../client/client.controller');

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
                prototype: true,
                stages: stages
            });
            newLifecycle.save()
                .then(savedLifecycle => {
                    res.status(201).json({message: 'Lifecycle created.', data: savedLifecycle})
                })
            })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

exports.createProject = (req, res, next) => {
    const projectId = req.body.projectId;
    const clientId = req.body.clientId;
    let stages;
    ProjectLifecycle.findById(projectId)
        .then(lifecycle => {
            if (!lifecycle) {
                const error = new Error('Lifecycle template not found.');
                error.statusCode = 404;
                return next(error)
            };
            stages = lifecycle.stages;
            const newLifecycle = new ProjectLifecycle({
                title: lifecycle.title,
                description: lifecycle.description, 
                prototype: false, 
                stages: [],
                notes: []
            });
            newLifecycle.save()
                .then(savedLifecycle => {
                    return loadStagesToLifecycle(savedLifecycle._id, stages)
                })
                .then(updatedLifecycle => {
                    addProject(clientId, updatedLifecycle._id);
                    return updatedLifecycle
                })
                .then(updatedLifecycle => {
                    res.status(201).json({messsage: 'Lifecycle created.', data: updatedLifecycle})
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

exports.addNoteToProject = (req, res, next) => {
    const projectId = req.body.projectId;
    const note = req.body.note;
    ProjectLifecycle.findById(projectId)
        .then(lifecycle => {
            if (!lifecycle) {
                const error = new Error('Lifecycle not found.');
                error.statusCode = 404;
                return next(error)
            };
            lifecycle.notes.push(note);
            lifecycle.save()
                .then(savedLifecycle => {
                    res.status(201).json({message: 'A new note was created.', data: savedLifecycle})
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

exports.deleteProject = (req, res, next) => {
    const projectId = req.body.projectId;
    ProjectLifecycle.findByIdAndDelete(projectId)
        .then(deletedProject => {
            if (!deletedProject) {
                const error = new Error('Delete operation failed - project was not found.');
                error.statusCode = 404;
                return next(err)
            };
            deleteLifecycleStages(deletedProject.stages)
                .then(() => {
                    res.status(200).json({message: 'Project deleted.', data: deletedProject})
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}