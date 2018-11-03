var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:username/:postid', (req, res, next) => {
    let username = req.params.username;
    let postid = req.params.postid;
    res.render('blog',
    {
	username: username,
	postid: postid
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
