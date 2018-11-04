var express = require('express');
var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var router = express.Router();
const url = 'mongodb://localhost:27017/'

/* GET home page. */
router.get('/:username/:postid', (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    var query = { username: username, postid: postid };

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db('cs144');
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
    var query = { username: username };

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db('cs144');
	
        dbo.collection('Posts').find(query, {projection:{_id: 0, username: 0}}).toArray( (err, docs) => {
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

module.exports = router;
