var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var router = express.Router();
var secret = require('../config').secret;

const jwt = require('jsonwebtoken');

const assert = require('assert');
const url = 'mongodb://localhost:27017/'

var urlencodedParser = bodyParser.urlencoded({ extended: true });
var jsonencodedParser = bodyParser.json();

function authenticate(req) {
        return new Promise((resolve, reject) => {
            if(!req.headers['cookie']) return resolve(false);
            let clientToken = req.headers['cookie'].replace('jwt=', '');
	    
	    jwt.verify(clientToken, secret, (err, decoded) => {
            if(clientToken){
                if(err){
		            return resolve(false);
	            }
	            let now = (new Date()).getTime() / 1000;
	            let result = req.params.username == decoded.username && (now < decoded.expiresIn);
	            console.log(result);
	            return resolve(result);
    	    }
            else{
                return resolve(false);
            }
        });   
    });
}

router.get('/:username/:postid', (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
   
    if(isNaN(postid)){
        res.status(400).send('postid is not a number');
        return;
    }
   
    let query = { username: username, postid: postid };
    
    let authPromise = authenticate(req);
    authPromise.then(auth => {
        if(!auth){
            res.status(401).send('Authentication failed. Please login');
	        return;
        }
        else{
            var dbo = req.app.locals.dbo;
            dbo.collection('Posts').findOne(query,
            { projection:{ _id: 0, postid: 0, username: 0 } },
            (err, doc) => {
                if(err) console.log(err);
                if(doc){
                    doc.modified = new Date(doc.modified).getTime();
                    doc.created = new Date(doc.created).getTime();
                    res.json(doc);
                }
                else{
                    res.status(404).send('Record is not found');
                }
            });
        }
   });
});

router.get('/:username/', (req, res, next) => {
    let username = req.params.username;
    let query = { username: username };

    let authPromise = authenticate(req);
    authPromise.then(auth => {
	console.log(auth);
        if(!auth){
            res.status(401).send('Authentication failed. Please login');
	        return;
        }
        else{
            var dbo = req.app.locals.dbo;
            dbo.collection('Posts').find(query, { projection:{ _id: 0, username: 0 } }).toArray( (err, docs) => {
                assert.equal(null, err);
                console.log('Found the following records.');

                res.json(docs);
            });
        }
    });
});

router.post('/:username/:postid', jsonencodedParser, (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    if(isNaN(postid)){
        res.status(400).send('postid is not a number');
        return;
    }
    let title = req.body.title;
    let body = req.body.body;
    console.log(req.body); 
    if(!title || !body){
        res.status(400).send('No data specified in json');
        return;
    }

    let authPromise = authenticate(req);
    authPromise.then(auth => {
	    console.log(auth);
        if(!auth){
            res.status(401).send('Authentication failed. Please login');
	        return;
        }
        else{
            var dbo = req.app.locals.dbo;
            let newDoc = {
                username: username,
                postid: postid,
                title: title,
                body: body,
                created: (new Date()).getTime(),
                modified: (new Date()).getTime()
            };
            let query = { username: username, postid: postid };

            dbo.collection('Posts').findOne(query, (err, doc) => {
                if(err){
                    console.log(err);
                    return;
                }
                if(doc){
                    res.status(400).send('Post with that username and postid already exists');
                }
                else{
                    dbo.collection('Posts').insertOne(newDoc, (err) => {
                    if(err) console.log(err);
                    res.status(201).send('Record created successfully');
                    });
                }
            });
        }
    });
});

router.put('/:username/:postid', jsonencodedParser, (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    if(isNaN(postid)){
        res.status(400).send('postid is not a number');
        return;
    }
    let title = req.body.title;
    let body = req.body.body;
    let modified = (new Date()).getTime();
    
    if(!title || !body){
        res.status(400).send('No data specified in json');
        return;
    }
    
    let authPromise = authenticate(req);
    authPromise.then(auth => {
	    console.log(auth);
        if(!auth){
            res.status(401).send('Authentication failed. Please login');
	        return;
        }
        else{
            var dbo = req.app.locals.dbo;
            let query = { username: username, postid: postid };
            dbo.collection('Posts').findOne(query, (err, doc) => {
                if(!doc){
                    res.status(400).send('Post with that username and postid does not exist');
                }
                else{
                    dbo.collection('Posts').updateOne(
                        { 'username': username, 'postid': postid },
                        { $set: { title: title, body: body, modified: modified } }
                    );
                    res.status(200).send('Record updated successfully');
                }
            });
        }
    });  
});

router.delete('/:username/:postid', urlencodedParser, (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    if(isNaN(postid)){
        res.status(400).send('postid is not a number');
        return;
    }
    let authPromise = authenticate(req);

    authPromise.then(auth => {
	    console.log(auth);
        if(!auth){
            res.status(401).send('Authentication failed. Please login');
	        return;
        }
        else{
            var dbo = req.app.locals.dbo;
            let query = { username: username, postid: postid };
            dbo.collection('Posts').findOne(query, (err, doc) => {
                if(!doc){
                    res.status(400).send('Post with that username and postid does not exist');
                }
                else{
                    dbo.collection('Posts').deleteOne(query);
                    res.status(204).send('Record deleted successfully');
                }
            });
        }
    });
});

module.exports = router;
