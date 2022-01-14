//modules
const mongoose = require('mongoose');
const express = require("express");
const http = require('http');
const path = require("path");
//creating node app
const app = express();
//creating server
const server = http.createServer(app);
app.use(express.urlencoded(true))
//connecting to mongoDb
let URI = "mongodb+srv://deepank:passwordforbot@cluster0.wopim.mongodb.net/ChatBot?retryWrites=true&w=majority";
// let URI = "mongodb://localhost:27017/botDb";
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
const questionsAskedSchema = new mongoose.Schema({
    query: String,
})

//models
const studentId = mongoose.model('studentids', StudentIdSchema);
const details = mongoose.model('details', detailschema);
const questions = mongoose.model('questions', questionsSchema);
const admin = mongoose.model('admin', adminSchema);
const questionsAsked = mongoose.model('questionsAsked', questionsAskedSchema);
//get method
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/details', (req, res) => {
    questionsAsked.find({}, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            if(data){
                var result = Object.entries(data);
                console.log(result[1][1].query);
            res.render('details', {
                ques: result
            });
        }
        }
    })
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
    var questionAsk = new questionsAsked(req.body);
    questionAsk.save()
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
        }
    });
    questions.findOne({
        Question: {
            $regex: text
        }
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