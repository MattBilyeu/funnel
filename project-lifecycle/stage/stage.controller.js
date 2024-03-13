const Stage = require('./stage.model');

exports.create = (req, res, next) => {
    const title = req.body.title;
    const desc = req.body.desc;
    const prototype = req.body.prototype;
    Stage.findOne({title: title})
        .then(stage => {
            if (stage) {
                const error = new Error('A stage with that title already exists!');
                error.statusCode = 422;
                return next(error)
            };
            const newStage = new Stage({
                title: title,
                description: desc,
                prototype: prototype,
                status: 'Not started'
            });
            if (prototype) {
                newStage.status = 'Prototype'
            };
            
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}