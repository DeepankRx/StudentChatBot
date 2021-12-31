const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require("express");
const http = require('http');
const bodyparser = require("body-parser");
const path = require("path");
//student chat bot
const token = "5030251873:AAHdAZsdW4L8YFl_86GkWI9NNGx2Fl7farU";

const bot = new TelegramBot(token, {
    polling: true
});
const app = express();
const server = http.createServer(app);
app.use(express.urlencoded(true))
let URI = "mongodb://localhost:27017/botDb";
mongoose.connect(URI);
// , {useNewUrlParser: true, useUnifiedTopology: true,  useFindAndModify: false});


// app.use('/static', express.static('static'))
// For serving static files
app.use(express.urlencoded(true))
app.use(express.static(__dirname + '/static/'));
app.set('view engine', 'pug') // Set the template engine as pug
app.set('views', path.join(__dirname, 'views'))


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'), () => {
    console.log("error in connection to database");
});
db.once('open', function () {
    // we're connected!
    console.log(" connected to database");
});
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

const studentId = mongoose.model('studentids', StudentIdSchema);
const details = mongoose.model('details', detailschema);

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', (req, res) => {
    let text = req.body.query;
    console.log(text);
    // studentId.findOne({studentId: text}, function (err, docs) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     else {
    //         console.log(docs);
    //         res.render('index', {
    //             data: docs.StudentName,
    //             data1: docs.FatherName,
    //             data2: docs.CollegeName,
    //             data3: docs.Course,
    //             data4: docs.Branch,
    //             data5: docs.Section,
    //             data6: docs.FatherNumber,
    //             data7: docs.StudentNumber,
    //             data8: docs.Email,
    //         });
    //     }
    // })

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
                        res.render('details', {
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
            } else {
                console.log("Data:" +
                    data);
                res.render('details', {
                    msg: "NOT FOUND"
                });
                // bot.sendMessage(chatId, "Student not found");
            }
        }
    });
    // res.status(200).render('index', {text,x,str});
})

// });
const PORT = process.env.PORT || 9000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));