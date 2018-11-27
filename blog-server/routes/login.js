var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

const assert = require('assert');
const url = 'mongodb://localhost:27017/'

var urlencodedParser = bodyParser.urlencoded({ extended: true });

/* GET home page. */
router.get('/', (req, res, next) => {
    var redirect = req.query.redirect;
    var context = { redirect: redirect };
    res.render('login', context);
});

router.post('/', urlencodedParser, (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var redirect = req.body.redirect;
    var query = { username: username };

    var dbo = req.app.locals.dbo;

    dbo.collection('Users').findOne(query, { projection:{_id: 0, username: 0} }, (err, doc) => {
        assert.equal(null, err);
        if(doc){
            console.log(doc.password);
            bcrypt.compare(password, doc.password, (err, result) =>{
                if(result){
                    console.log('User found');
                    if(redirect) {
                        var exp = Math.floor((new Date).getTime()/1000) + 7200;
                        var token = jwt.sign({expiresIn: exp, username: username}, secret);
                        res.status(200, 'Authentication successful').cookie('jwt', token);
                        res.redirect(redirect);
                    }
                    else{
                        res.sendStatus(200, 'Authentication successful');
                    }
                }
                else{
                    console.log('User not found');
                    res.status(401, 'Authentication unsuccessful');
                    res.render('login', { redirect: '' });
                }
            });
        }
        else{
            console.log('User not found');
            res.status(401, 'Authentication unsuccessful');
            res.render('login', { redirect: '' });
        }
    });
});

module.exports = router;
