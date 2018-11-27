var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser')();
var atob = require('atob');
var staticMiddleware = express.static(__dirname + "/public/editor");

const assert = require('assert');
const url = 'mongodb://localhost:27017/'

function parseJWT(token) 
{
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

router.get('/', cookieParser, function(req, res, next) {
    if(req.cookies.jwt == null){
        res.redirect('/login?redirect=/editor/');
    }
    let cookie = parseJWT(req.cookies.jwt)
    console.log('Cookies:', cookie);
    
    let now = Date.now()/1000;
    if(now >= cookie.expiresIn){
        res.redirect('/login?redirect=/editor/');
    }

    var query = { username: cookie.username };
    var dbo = req.app.locals.dbo;
    dbo.collection('Users').findOne(query, (err, doc)=> {
        assert.equal(null, err);
        if(doc){
            console.log('User authenticated');
            staticMiddleware(req, res, next); 
        }
        else{
            res.redirect('/login?redirect=/editor/');
        }
    }); 
});

module.exports = router;
