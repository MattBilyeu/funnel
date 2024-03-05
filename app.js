const mongoURI = require('./util/protected').mongoURI;
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const secret = require('./util/protected').secret;
const helmet = require('helmet');
const compression = require('compression');

const app = express();

app.use(helmet());
app.use(compression());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('**', (req, res, next)=> {res.sendFile(path.join(__dirname, 'public', 'index.html'))});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({message: err.message, error: err})
})

mongoose.connect(mongoURI)
    .then(()=> {
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => console.log('MongoDB Connection Error: ', err));