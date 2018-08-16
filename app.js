var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis');

var app = express();

// Create Client
var client = redis.createClient();
client.on('connect', () => {
    console.log('Redis Server connected...');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    var title = 'Task List';
    client.lrange('tasks', 0, -1, (err, reply) => {
        client.hgetall('call', (err, call) => {
            res.render('index', {
                title: title,
                tasks: reply,
                call: call
            });
        });
        
    });
    
});

app.post('/task/add', (req, res) => {
    var task = req.body.task;
    client.rpush('tasks', task, (err, reply) => {
        if (err) {
            console.log(err);
        }
        console.log('Task Added...');
        res.redirect('/');
    });
});

app.post('/task/delete', (req, res) => {
    var tasksToDel = req.body.tasks;
    client.lrange('tasks', 0, -1, (err, tasks) => {
        for(var i = 0; i < tasks.length; i++) {
            if (tasksToDel.indexOf(tasks[i]) > -1) {
                client.lrem('tasks', 0, tasks[i], () => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
        res.redirect('/');
    });
});

app.post('/call/add', (req, res) => {
    var newCall = {};
    newCall.name = req.body.name;
    newCall.company = req.body.company;
    newCall.phone = req.body.phone;
    newCall.time = req.body.time;

    client.hmset('call', ['name', newCall.name, 'company', newCall.company, 'phone', newCall.phone, 'time', newCall.time], (err, reply) => {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    })
});



app.listen(3490);
console.log('Server started on Port 3490');
module.exports = app;