var util = require('util'),
    http= require('http'),
    https= require('https'),
    URL= require('url'),
    socialanimal= require('socialanimal');

// for interesting HTTP[S] handling, see oath.js in the oauth package in npm

/**
 * `Provider` constructor
 **/

function TwitProvider(options) {
  options = options || {};
  options.requestURL = options.requestURL || 'http://api.twitter.com/';

  if (!options.user_id) throw new Error('socialanimal-twitter requires a user id option');

  this.name = "twit";
  this._requestURL = options.requestURL;
  this.user_id = options.user_id;
}

util.inherits(TwitProvider, socialanimal.Provider);

TwitProvider.prototype._doRequest = function(url, cb) { 

  var parsedURL = URL.parse(url, false);
  if( parsedURL.protocol == "http:" && !parsedURL.port ) parsedURL.port= 80;
  if( parsedURL.protocol == "https:" && !parsedURL.port ) parsedURL.port= 443;

  var httpMod;
  if (parsedURL.protocol === "http:") httpMod = http;
  if (parsedURL.protocol === "https:") httpMod = https;

  var path;
  if( !parsedURL.pathname  || parsedURL.pathname == "" ) parsedURL.pathname ="/";
  if( parsedURL.query ) path= parsedURL.pathname + "?"+ parsedURL.query ;
  else path= parsedURL.pathname;

  var options = {
    host: parsedURL.hostname,
    port: parsedURL.port,
    path: path,
    method: 'GET'
  };
  
  var request = httpMod.request(options);
  var data="";
  var self = this;

  request.on('response', function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function() {
      if (response.statusCode >= 200 && response.statusCode <= 299) {
        cb(null, data);
      } else {
        cb({statusCode: response.statusCode, data: data}, data);
      }
    });
  });

  request.on("error", function(err) {
    cb(err);
  });

  request.end();
}

/**
 * friends - returns the list of friend ids
 * currently disregards paged return data, etc
 */
TwitProvider.prototype.friends = function(options, callback) {
  if (!callback) { callback = options; options = {}; }
  var url = this._requestURL + '/1/friends/ids.json?cursor=-1&user_id='+this.user_id

  this._doRequest(url, function(err, data) {
    if (err) { callback(err); return; }
    var ret = JSON.parse(data);
    callback(null, ret.ids);
  }); 
};


/**
 * followers - returns the list of follower ids
 * currently disregards paged return data
 */
TwitProvider.prototype.followers = function (options, callback) {

  if (!callback) { callback = options; options = {}; }

  var url = this._requestURL + '/1/followers/ids.json?cursor=-1&user_id='+this.user_id

  this._doRequest(url, function(err, data) {
    if (err) { callback(error); return; }
   
    var ret = JSON.parse(data); 
    callback(null, ret.ids);
  }); 
};

module.exports = TwitProvider;
