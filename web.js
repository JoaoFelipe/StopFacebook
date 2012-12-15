var async   = require('async');
var express = require('express');
var util    = require('util');

var APP_ID = process.env.FACEBOOK_APP_ID || "174829115993664"; 
var SECRET = process.env.FACEBOOK_SECRET || "df774357c707eff88f38d0050e5ca29f"; 

console.log(APP_ID);
console.log(SECRET);



// create an express webserver
var app = express.createServer(
    //express.logger(),
    express.static(__dirname + '/public'),
    express.bodyParser(),
    express.cookieParser(),
    // set this to a secret value to encrypt session cookies
    express.session({ secret: process.env.SESSION_SECRET || 'secret123' }),
    require('faceplate').middleware({
        app_id: APP_ID,
        secret: SECRET,
        scope:  'user_likes'
    })
);

// listen to the PORT given to us in the environment
var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log("Listening on " + port);
});

app.dynamicHelpers({
    'host': function(req, res) {
        return req.headers['host'];
    },
    'scheme': function(req, res) {
        req.headers['x-forwarded-proto'] || 'http'
    },
    'url': function(req, res) {
        return function(path) {
            return app.dynamicViewHelpers.scheme(req, res) + app.dynamicViewHelpers.url_no_scheme(path);
        }
    },
    'url_no_scheme': function(req, res) {
        return function(path) {
            return '://' + app.dynamicViewHelpers.host(req, res) + path;
        }
    },
});

function render_page(req, res, app, user) {
    res.render('index.ejs', {
        layout:    false,
        req:       req,
        app:       app,
        user:      user
    });  
}

function handle_facebook_request(req, res) {
    req.facebook.app(function(app) {
        req.facebook.me(function(user) {
            //console.log(user);
        // if the user is logged in
            if (req.facebook.token) {

                var par = [];
                if (req.query['request_ids']) {
                    var requests = req.query['request_ids'].split(',');
                    for (var i = 0; i < requests.length; i += 1) {
                        var request = requests[i];
                        var request_id = request + '_' + user.id;
                        
                        
                        par.push(function(cb) {
                            
                            req.facebook.get('/'+request_id , function(result) {
                                if (typeof result == "string") {
                                    req.next_room = JSON.parse(result+'').room;
                                    console.log(req.next_room);
                                }
                                
                                cb();
                            });

                        });
                        
                    }
                }

                async.parallel([].concat(par), function() {
                    render_page(req, res, app, user);
                });

            } else {
                if (req.query['request_ids']) {
                    req.has_request = true;
                }

                render_page(req, res, app, user);
            }
        });
    });
}

app.get('/', handle_facebook_request);
app.post('/', handle_facebook_request);
