var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var router = express.Router();

const assert = require('assert');
const url = 'mongodb://localhost:27017/'

var urlencodedParser = bodyParser.urlencoded({ extended: true });
var jsonencodedParser = bodyParser.json();
/*
var clientToken = req.headers['cookie'].replace('jwt=', '');
MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
var dbo = db.db('Users');
}
if(clientToken){
jwt.verify(clientToken, secret, (err, decoded) => {
	if(err){
	return res.status(500);
}
console.log(decoded);
dbo.collection().findOne({username: decoded.username}, (err, doc)=> {
	assert.equal(null, err);
	if(doc){
		
	}
	else{
		res.status(401, 'Invalid Token');
		return;
	}
});
return res.status(200,'Token found');
});
}
*/
/* GET home page. */
router.get('/:username/:postid', (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    let query = { username: username, postid: postid };

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db('BlogServer');
        dbo.collection('Posts').findOne(query, {projection:{_id: 0, postid: 0, username: 0}}, (err, doc) => {
	    if(err) console.log(err);
	    if(doc){
		doc.modified = new Date(doc.modified);
		doc.created = new Date(doc.created);
                res.json(doc);
            }
            else{
	        res.status(404).send('Record is not found');
	    }
	});
        db.close();	
    });
});

router.get('/:username/', (req, res, next) => {
    let username = req.params.username;
    let query = { username: username };

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        let dbo = db.db('BlogServer');
	
        dbo.collection('Posts').find(query, { projection:{ _id: 0, username: 0 } }).toArray( (err, docs) => {
	    assert.equal(null, err);
	    console.log('Found the following records.');

	    docs.forEach((doc)=>{
	        doc.modified = new Date(doc.modified);
		    doc.created = new Date(doc.created);
	    });
            res.json(docs);
        });
	db.close();
    });
});

router.post('/:username/:postid', jsonencodedParser, (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    let title = req.body.title;
    let body = req.body.body;

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        let dbo = db.db('BlogServer');
	var newDoc = {
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
		db.close();
	    }

            if(doc){
                res.status(400).send('Post with that username and postid already exists');
		db.close();
            }
            else{
                dbo.collection('Posts').insertOne(newDoc, (err) => {
		    if(err) console.log(err);
                    res.status(201).send('Record created successfully');
		    db.close();
                });
            }
        });
    });
});

router.put('/:username/:postid', jsonencodedParser, (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    let title = req.body.title;
    let body = req.body.body;
    let modified = (new Date()).getTime();
    
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        let dbo = db.db('BlogServer');
        let query = { username: username, postid: postid };
        dbo.collection('Posts').findOne(query, (err, doc) => {
            if(!doc){
                res.status(400).send('Post with that username and postid does not exist');
	        db.close();
            }
            else{
                dbo.collection('Posts').updateOne(
                    { 'username': username, 'postid': postid },
                    { $set: { title: title, body: body, modified: modified } }
                );
                res.status(200).send('Record updated successfully');
	        db.close();
            }
        });
    });
});

router.delete('/:username/:postid', urlencodedParser, (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        let dbo = db.db('BlogServer');
        let query = { username: username, postid: postid };
        dbo.collection('Posts').findOne(query, (err, doc) => {
            if(!doc){
                res.status(400).send('Post with that username and postid does not exist');
	        db.close();
            }
            else{
                dbo.collection('Posts').deleteOne(query);
                res.status(204).send('Record deleted successfully');
	        db.close();
            }
        });
    });
});

module.exports = router;
