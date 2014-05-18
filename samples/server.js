var jfb = require('../index')
, config = require('./config')
, request = require('request')
, fs = require('fs')
, accessTokenFile = 'accessToken';


//Initialize jfb
jfb.init(config.appId, config.appSecret, config.redirectUri);

var express=require('express');
var app = express();


app.get('/update_status', function(req,res){
    var message = req.query.message || 'this is a test message';
    var accessToken = fs.readFileSync(accessTokenFile);
    jfb.sendGraphAPIRequest(accessToken, {
        path: '/me/feed',
        method: 'POST',
        body: 'message='+encodeURIComponent(message)+'&privacy='+JSON.stringify({'value':'SELF'}),
        callback: function(err, result){
            if(!err)
                return res.send(result);
            return res.send(err);
        }
    });
});

app.get('/facebook_profile', function(req,res){
    var accessToken = fs.readFileSync(accessTokenFile);
    jfb.sendGraphAPIRequest(accessToken, {
        path: '/me',
        method: 'GET',
        body: '',
        callback: function(err, result){
            if(!err)
                return res.send(result);
            return res.send(err);
        }
    });
});

app.get('/facebook_callback', function(req,res){
    var code = req.query.code;
    jfb.getAccessTokenUsingCode(code, {
        callback: function(err, result){
            if(!err){
                //Access Token here
                fs.writeFileSync(accessTokenFile, result);
                res.send(result);
            }
            else{
                res.send('error');
            }
        }
    });
});

app.get('/', function(req,res){
    var html = '<a href="'+jfb.fbUserLogin({scope: 'publish_actions'})+'"> login to facebook </a>';
    res.send(html);
});

app.listen(3000);