const Team = require('./team.model');
const User = require('../user/user.model');

function addTeamIds(memberIds, teamId) {
    memberIds.forEach(Id => {
        User.findByIdAndUpdate(Id, {$addToSet: {teams: teamId}})
    })
}

function removeTeamIds(memberIds, teamId) {
    memberIds.forEach(Id => {
        User.findById(Id)
            .then(user => {
                user.teams = user.teams.filter(Id => Id !== teamId);
                user.save()
            })
    })
}

module.create = (req, res, next) => {
    const title = req.body.title;
    Team.findOne({title: title})
        .then(team => {
            if (team) {
                const error = new Error('A team with that title already exists.');
                error.statusCode = 422;
                return next(error);
            };
            const newTeam = new Team({
                title: title,
                members: [],
                stagesWorked: []
            });
            return newTeam.save()
                .then(savedTeam => {
                    res.status(201).json({message: 'Team created.', data: savedTeam})
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

module.addMembers = (req, res, next) => {
    const memberIds = req.body.members;
    const teamId = req.body.teamId;
    Team.findById(teamId)
        .then(team => {
            if (!team) {
                const error = new Error('Team not found.');
                error.statusCode = 404;
                return next(error)
            };
            let modifiedIds = [];
            memberIds.forEach(memberId => {
                if (team.members.indexOf(memberId) === -1) {
                    team.members.push(memberId);
                    modifiedIds.push(memberId);
                }
            });
            addTeamIds(modifiedIds, team._id);
            return team.save()
                .then(savedTeam => {
                    res.status(200).json({message: 'Members added to team.', data: savedTeam})
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

module.removeMembers = (req, res, next) => {
    const memberIds = req.body.members;
    const teamId = req.body.teamId;
    Team.findById(teamId)
        .then(team => {
            if (!team) {
                const error = new Error('Team not found.');
                error.statusCode = 404;
                return next(error)
            };
            team.members = team.members.filter(Id => !memberIds.includes(Id));
            removeTeamIds(memberids, teamId);
            return team.save()
                .then(savedTeam => {
                    res.status(200).json({message: 'Members added to team.', data: savedTeam})
                })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

module.assignStages = (req, res, next) => {
    const stageIds = req.body.stageIds;
    const teamId = req.body.teamId;
    Team.findById(teamId)
        .then(team => {
            if (!team) {
                const error = new Error('Team not found.');
                error.statusCode = 404;
                return next(error)
            };
            stageIds.forEach(Id => {
                if (team.stagesWorked.indexOf(Id) === -1) {
                    team.stagesWorked.push(Id)
                }
            });
            return team.save()
                    .then(savedTeam => {
                        res.status(200).json({message: 'Stages added.', data: savedTeam})
                    })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

module.removeStages = (req, res, next) => {
    const stageIds = req.body.stageIds;
    const teamId = req.body.teamId;
    Team.findById(teamId)
        .then(team => {
            if (!team) {
                const error = new Error('Team not found.');
                error.statusCode = 404;
                return next(error)
            };
            team.stagesWorked = team.stagesWorked.filter(Id => !stageIds.includes(Id));
            return team.save()
                    .then(savedTeam => {
                        res.status(200).json({message: 'Stages added.', data: savedTeam})
                    })
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}

module.deleteTeam = (req, res, next) => {
    const teamId = req.body.teamId;
    Team.findByIdAndDelete(teamId)
        .then(deletedTeam => {
            if (!deletedTeam) {
                const error = new Error('There was an error deleting that team, please refresh your browser and try again.');
                error.statusCode = 500;
                return next(error)
            };
            removeTeamIds(deletedTeam.members, deletedTeam._id);
            res.status(200).json({message: 'Team deleted', data: null})
        })
        .catch(err => {
            err.statusCode = 500;
            next(err)
        })
}