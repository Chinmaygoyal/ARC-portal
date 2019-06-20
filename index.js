const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const studentRouter = require('./routes/students');
const tokenRouter = require('./routes/token');
const app = express();
const projectRouter=require('./routes/projects');
const homeRouter=require('./routes/home');
const requestRouter=require('./routes/requests');


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use('/auth/student', studentRouter);
app.use('/token', tokenRouter);
app.use('/project',projectRouter);
app.use('/home',homeRouter);
app.use('/request',requestRouter);

// Environment variables
const PORT = config.get("PORT");
const DB_URL = "mongodb+srv://new_user1:Arciitk@arcportal-z5xml.mongodb.net/test?retryWrites=true&w=majority"

// Connect to MongoDB
mongoose.connect(DB_URL, { useNewUrlParser: true }, (err, result) => {
    if (err) {
        console.error('Couldn\'t connect to database, aborting...');
        process.exit(1);
    };
    console.log("Connected to MongoDB.");
});

// Start the server
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Server live at port ${PORT}.`);
})

