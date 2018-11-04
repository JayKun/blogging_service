var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var bodyParser = require('body-parser');

const assert = require('assert');
const url = 'mongodb://localhost:27017/'

var urlencodedParser = bodyParser.urlencoded({ extended: true });

/* GET home page. */
router.get('/:redirect?', (req, res, next) => {
    var redirect = req.params.redirect;
    res.render('login');
});

router.post('/', urlencodedParser, (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var query = { username: username, password: password };

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db('cs144');
	
        dbo.collection('Users').find(query, {projection:{_id: 0, username: 0}}, (err, doc) => {
	    assert.equal(null, err);
	    if(doc){
	        console.log('User found');
	    }
	    else{
                console.log('User not found');
	    }
        });
	db.close();
    });
});

module.exports = router;
