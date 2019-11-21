const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var bodyParser = require("body-parser");
var cors = require('cors');

const url = 'mongodb://localhost:27017';
const dbName = 'hamlit_subscribers';

var nodemailer = require('nodemailer');
var fs = require('fs');
var handlebars = require('handlebars');

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.end();
});

app.post('/subscribe', function (req, res) {
    var data = req.body;
    data['time'] = new Date();
    data["email_sent"] = false;
    sendEmail(data.email);
    initDB(function (db, client) {
        insertDocuments(db, data, function () {
            client.close();
        });
    });
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.write(JSON.stringify(data));
    res.end();
});

const initDB = function (callback) {
    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        callback(db, client);
    });
}

const insertDocuments = function (db, data, callback) {
    const collection = db.collection('subscribers');
    collection.insert(data, function (err, result) {
        callback(result);
    });
};

const findDocuments = function (db, callback) {
    const collection = db.collection('subscribers');
    collection.find({}).toArray(function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
}

function sendEmail(to) {
    var buffer = fs.readFileSync('public/sub_temp.html');
    var html = buffer.toString();
    var template = handlebars.compile(html);
    var replacements = {};
    var htmlToSend = template(replacements);
    var transporter = nodemailer.createTransport({
        host: 'smtp.zoho.in',
        port: 465,
        secure: true,
        auth: {
            user: 'hello@hamlit.co',
            pass: 'S2TJfBYAVWTv'
            //pass: 'MU7p2xpXNT0y'
        }
    });

    var mailOptions = {
        from: 'hello@hamlit.co',
        to: to,
        subject: 'Welcome to Hamlit',
        html: htmlToSend
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.listen(3000, '0.0.0.0');