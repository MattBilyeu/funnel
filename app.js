const mongoURI = require('./util/protected').mongoURI;
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const secret = require('./util/protected').secret;
const helmet = require('helmet');
const compression = require('compression');

const app = express();

const adminRoutes = require('./admin/admin.routes');
const authRoutes = require('./auth/auth.routes');
const clientRoutes = require('./client/client.routes');
const projectRoutes = require('./project-lifecycle/project-lifecycle.routes');
const stageRoutes = require('./project-lifecycle/stage/stage.routes');
const teamRoutes = require('./team/team.routes');
const userRoutes = require('./user/user.routes');
const getRoutes = require('./getter/getter.routes');

app.use(helmet());
app.use(compression());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/admin', adminRoutes);
app.post('/authRoutes', authRoutes);
app.post('/client', clientRoutes);
app.post('/project', projectRoutes);
app.post('/stage', stageRoutes);
app.post('/team', teamRoutes);
app.post('/user', userRoutes);

app.get('/get', getRoutes);

app.get('**', (req, res, next)=> {res.sendFile(path.join(__dirname, 'public', 'index.html'))});

app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({message: err.message, error: err})
})

mongoose.connect(mongoURI)
    .then(()=> {
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => console.log('MongoDB Connection Error: ', err));