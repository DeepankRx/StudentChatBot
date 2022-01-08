//modules
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require("express");
const http = require('http');
const bodyparser = require("body-parser");
const path = require("path");
//telegram api key
const token = "5030251873:AAHdAZsdW4L8YFl_86GkWI9NNGx2Fl7farU";
//verify token
const bot = new TelegramBot(token, {
    polling: true
});
//creating node app
const app = express();
//creating server
const server = http.createServer(app);
app.use(express.urlencoded(true))
//connecting to mongoDb
let URI = "mongodb://localhost:27017/botDb";
mongoose.connect(URI);
app.use(express.urlencoded(true))
//initializing static directory
app.use(express.static(__dirname + '/static/'));
// Set the template engine as pug
app.set('view engine', 'pug')
// Set the views directory
app.set('views', path.join(__dirname, 'views'))

//checking connection with mongoDb
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'), () => {
    console.log("error in connection to database");
});
db.once('open', function () {
    // we're connected!
    console.log(" connected to database");
});
//schemas
const StudentIdSchema = new mongoose.Schema({
    StudentID: String,
    StudentName: String,
    PrevSection: String,
    Performance: Number,
    CurSec: String
});
const detailschema = new mongoose.Schema({
    SNO: Number,
    StudentName: String,
    FatherName: String,
    CollegeName: String,
    Course: String,
    Branch: String,
    Section: String,
    FatherNumber: Number,
    StudentNumber: Number,
    Email: String
});
const questionsSchema = new mongoose.Schema({
    Question: {
        type: String,
        uppercase: true,

    },
    Answer: {
        type: String,
        uppercase: true,
    }
});
const adminSchema = new mongoose.Schema({
    AdminName: String,
    Password: String,
});


//models
const studentId = mongoose.model('studentids', StudentIdSchema);
const details = mongoose.model('details', detailschema);
const questions = mongoose.model('questions', questionsSchema);
const admin = mongoose.model('admin', adminSchema);
//get method
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/login', (req, res) => {
    res.render('login');
});


//post method
app.post('/addDetails', (req, res) => {


    var myData = new questions(req.body);


    myData.save().then(() => {
        res.status(200).render('addDetails');
    }).catch(() => {
        res.status(200).render('404');
    });
});
app.post('/', (req, res) => {
    let text = req.body.query;
    console.log(text);
    studentId.findOne({
        StudentID: text
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                let name = data.StudentName;
                console.log("Name is " + name);
                details.findOne({
                    StudentName: name
                }, function (err, data1) {
                    if (err) {
                        // console.log(err);
                        bot.sendMessage(chatId, "NOT FOUND");
                    } else {
                        console.log(data1);
                        res.render('index', {
                            data: data1.StudentName,
                            data1: data1.FatherName,
                            data2: data1.CollegeName,
                            data3: data1.Course,
                            data4: data1.Branch,
                            data5: data1.Section,
                            data6: data1.FatherNumber,
                            data7: data1.StudentNumber,
                            data8: data1.Email
                        });
                    }
                });
            }
            //  else {
                // console.log("Data:" +
                //     data);
                // res.render('index', {
                //     msg: "NOT FOUND"
                // });
                // res.send("BYE");
            // }
        }
    });

    questions.findOne({
        Question:{$regex: text}
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                let question = data.Question;
                let answer = data.Answer;
                console.log("Question is " + question);
                console.log("Answer is " + answer);
                res.render('index', {
                    question: question,
                    answer: answer
                });

            } 
            // else
            // {
            //     // res.send("HI");
            // }
            // else {
            //     console.log("Data:" +
            //         data);
            //     res.render('index', {
            //         msg: "NOT FOUND"
            //     });
            // }
        }
    });
})
app.post('/login', (req, res) => {
    let username = (req.body.username).toUpperCase();
    let password = (req.body.password).toUpperCase();
    console.log(username);
    console.log(password);
    admin.findOne({
        AdminName: username,
        Password: password
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                //data is the object
                res.status(200).render('addDetails'); //rendering the login page
            } else {
                console.log(err);
                res.status(200).render('login');
            }
        }
    });
})
//port
const PORT = process.env.PORT || 9000;
//starting the server       
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));