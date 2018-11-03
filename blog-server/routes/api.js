
var express = require('express');
const commonmark = require('commonmark');
var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var router = express.Router();
const url = 'mongodb://localhost:27017/'

function parseMarkdown(s)
{
    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();
    var parsed = reader.parse(s);
    var result = writer.render(parsed);
    return result;
}

/* GET home page. */
router.get('/:username/:postid', (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    var query = { username: username, postid: postid };

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db('cs144');
        dbo.collection('Posts').find(query).forEach((doc) => {
	    assert.equal(null, err);
	    console.log('Found the following record.');
          
            res.render('blog', {
	        username: username,
	        postid: postid,
	        title: parseMarkdown(doc.title),
		body: parseMarkdown(doc.body)
            });
        });
	db.close();
	res.status(404).send('Record is not found');
    });
});

router.get('/:username/', (req, res, next) => {
    let username = req.params.username;
    var query = { username: username };

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db('cs144');
	
        dbo.collection('Posts').find(query).toArray( (err, docs) => {
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
