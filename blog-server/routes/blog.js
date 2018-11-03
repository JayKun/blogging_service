var express = require('express');
var mongoClient = require('mongodb').MongoClient;

var router = express.Router();
const url = 'mongodb://localhost:27017/'
const client = new mongoClient(url);

/* GET home page. */
router.get('/:username/:postid', (req, res, next) => {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    let query = { username: username, postid: postid };

    client.connect((err, db) => {
        if(err) throw err;
        var dbo = db.db('cs144');
        dbo.collection('Posts').find(query).forEach((doc) => {
	    // if(err) thr err;
	    console.log('Found the following record.');
	    console.log(doc.username);
	    client.close();
           
            res.render('blog',{
	        username: username,
	        postid: postid,
	        title: doc.title,
	        body: doc.body
            });
	});
    });

});

router.get('/:username/', (req, res, next) => {
    let username = req.params.username;
    let postid = req.params.postid;
    res.render('blog',
    {
	username: username,
	postid: 1
    });
});

module.exports = router;
