function JFBApi(){
    var request = require('request');

    var that = this
    , appId = ''
    , appSecret = ''
    , redirectUri = '';

    //log in user to facebook/request,update permissions
    this.loginBaseUrl = 'https://www.facebook.com/dialog/oauth?'
    //base url for making graph api requests
    this.graphApiBaseUrl = 'https://graph.facebook.com';

    init = function init(appId, appSecret, redirectUri){
        if(!appId)
            throw new Error('Must have an appId');

        if(!appSecret)
            throw new Error('Must have appSecret');

        if(!redirectUri)
            throw new Error('Must have redirectUri');

        that.appId = appId;
        that.appSecret = appSecret;
        that.redirectUri = redirectUri;
    };

    /*
        sends the get and post request for the facebook graph api.  
        Check the facebook api documentation for the appropiate 
        paths.
    */
    sendGraphAPIRequest = function(accessToken,opt){
        opt = opt || {};
        var path = opt.path || '/me';
        var method = opt.method || 'GET';
        var body = opt.body || '';
        
        var callback = opt.callback;

        if(!callback || typeof callback !== 'function')
            throw new Error('Must specify a callback, function(err,result)');

        if(method === 'GET'){
            var url = that.graphApiBaseUrl + path+'?access_token='+accessToken;
            request(url, function(err, httpRes, body){
                if(err){
                    callback(err,null);
                }else{
                    if(body){
                        callback(null, body);
                    }else{
                        callback(new Error('No body in response'), null);
                    }
                }
            });
        }else{
            var url = that.graphApiBaseUrl+path;

            body += '&access_token='+accessToken;
            console.log('body: '+body);
            request({
                url: url,
                method:'POST',
                body:body
            }, function(err,response,body){
                if(err){
                    callback(err,null);
                }else{
                    if(body)
                        callback(null, body);
                    else
                        callback(new Error('no body in response'), null);
                }
            });
        }
    };

    /*
        creates the url for making the access token request
        for getAccessTokenUsingCode
    */

    this.createAccessTokenUrl = function createAccessTokenUrl(code,opt){
        var appId = opt.appId || that.appId
        , redirectUri = opt.redirectUri || that.redirectUri
        , appSecret = opt.appSecret || that.appSecret;

        return that.graphApiBaseUrl+'/oauth/access_token?client_id='+
        appId+'&redirect_uri='
        + redirectUri + '&client_secret='+appSecret + '&code='+code;
    };

    /*
        This takes the code from the callback url's query and gets
        an access token which lasts for 60 days
    */  
    getAccessTokenUsingCode = function(code,opt){
        if(!code)
            throw new Error('Must have a code');
        opt = opt || {};

        if(!opt.callback || typeof opt.callback !== 'function'){
            throw new Error('opt must have a callback: function(err, result)');
        }

        var callback = opt.callback;
        var url =  that.createAccessTokenUrl(code,opt);

        request(url, function(err, httpRes, body){
            if(err)
                callback(err,null);
            else{
                if(body.indexOf('access_token') > -1){
                    var temp = body.split('&');
                    var accessToken = temp[0].split('=')[1];
                    callback(null, accessToken);
                }else{
                    callback(new Error('no access_token in body'),null);
                }
            }
        });
    };

    /*
      Generates the URL that the user needs to go to in order
      to login to there facebook account, opt is a object contains
      additional parameters such as scope
    */
    fbUserLogin = function getLoginUrl(opt){
        opt = opt || {};

        var appId = opt.appId || that.appId
        , redirectUri = opt.redirectUri || that.redirectUri
        , scope = opt.scope
        , display = opt.display
        , state = opt.state
        , responseType = opt.responseType || 'code'
        , scopeQuery = ''
        , displayQuery = ''
        , stateQuery = '';

        if(scope)
            scopeQuery = '&scope='+encodeURIComponent(scope);

        if(display)
            displayQuery = '&display='+display;

        if(state)
            stateQuery = '&state='+state;

        redirectUri = encodeURIComponent(redirectUri);

        return that.loginBaseUrl+'response_type='+responseType+
        scopeQuery+displayQuery+stateQuery
        +'&redirect_uri='+redirectUri+'&client_id='+appId;
    };

    return {
        init:init,
        fbUserLogin:fbUserLogin,
        getAccessTokenUsingCode:getAccessTokenUsingCode,
        sendGraphAPIRequest:sendGraphAPIRequest
    };
}

module.exports = exports = new JFBApi();