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
        var dbo = db.db('BlogServer');
        dbo.collection('Posts').findOne(query, (err, doc) => {
	    assert.equal(null, err);
	    console.log(doc);
            if(doc){
		doc.title = parseMarkdown(doc.title);
		doc.body = parseMarkdown(doc.body);
		res.render('blog', {posts: [doc], length: 1});
		db.close();
		return;
            }
	    else{
	        db.close();
	        res.status(404).send('Record is not found');
            }
        });
    });
});

router.get('/:username/', (req, res, next) => {
    var username = req.params.username;
    if(req.query.start){
        var start = parseInt(req.query.start);
    }
    else var start = 0;
    console.log(start);
    var query = { username: username, postid: {$gte: start}};

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db('BlogServer');
	
        dbo.collection('Posts').find(query).toArray( (err, docs) => {
	    assert.equal(null, err);
            if(docs.length > 0){
		if (docs.length > 5){
		    var length = 5;
		}
		else{
		    var length = docs.length;
		}
		docs.forEach((doc)=>{
		    doc.title = parseMarkdown(doc.title);
		    doc.body = parseMarkdown(doc.body);
		});
	        res.render('blog', {posts: docs, username: username, length: length});
            }
	    else{
		res.status(404).send('Records with this username are not found');
	    }
        });
	db.close();
    });
});

module.exports = router;
