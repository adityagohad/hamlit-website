const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var bodyParser = require("body-parser");

const url = 'mongodb://localhost:27017';
const dbName = 'hamlit_subscribers';

const app = express();

app.use(bodyParser.json());

app.get('/subscribe', function (req, res) {
    var data = req.body;
    data['time'] = new Date();
    data["email_sent"] = false;
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

app.get('/', function (req, res) {
    res.end("here");
});

// app.get('/getAllDocuments', function (req, res) {
//     initDB(function (db, client) {
//         findDocuments(db, function (docs) {
//             res.writeHead(200, {
//                 'Content-Type': 'application/json'
//             });
//             res.write(JSON.stringify(docs));
//             res.end();
//             client.close();
//         });
//     });
// });

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

app.listen(3000, '0.0.0.0');