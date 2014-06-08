#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var path = require('path');
var request = require('request')
var async = require('async');
var parser = require('xml2json');

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/bg/:id/:page'] = function(req,res) {
            // console.log("here")
            id = req.params.id
            page = req.params.page
            request("http://www.boardgamegeek.com/xmlapi2/thing?id="+id+"&stats=1&comments=1&pagesize=100&page=" + page, function(err,response,body){
                res.send(parser.toJson(body))
            })
        };


        self.routes['/bg/:id'] = function(req,res) {
            // console.log("here")
            var id = req.params.id
            var options = {
                object: true,
                reversible: false,
                coerce: true,
                sanitize: false,
                trim: false,
                arrayNotation: false
            };
            var uris = ["http://www.boardgamegeek.com/xmlapi2/thing?id="+id+"&stats=1&comments=1&videos=1&pagesize=100",
            "http://boardgamegeek.com/xmlapi2/forumlist?id="+id+"&type=thing"]
            async.waterfall([
                function(callback){
                    request(uris[0], function(err,response,body){
                        var x = parser.toJson(body,options)
                        callback(null, x);
                    })
                },
                function(arg, callback){
                    request("http://boardgamegeek.com/xmlapi2/forumlist?id="+id+"&type=thing",function(err,response,body){
                        arg.items.item.forums = parser.toJson(body,options).forums.forum;
                        callback(null, arg);
                    })
                },
                function(arg, callback){
                    // console.log(arg.items.item.forums)
                    var count = 0;
                    var length = arg.items.item.forums.length;
                    var list = arg.items.item.forums
                    arg.items.item.forums = []
                    async.each(list, function(forum,callback){
                        request("http://boardgamegeek.com/xmlapi2/forum?id="+forum.id,function(err,response,body){
                            forum.threads = parser.toJson(body,options).forum.threads.thread || []
                            // var list2 = parser.toJson(body,options).forum.threads.thread;
                            // if (list2 == null || list2 == undefined) {
                            //     list2 = [];
                            // }
                            // forum.threads = []
                            // async.each(list2,function(thread,callback){
                            //     // console.log(thread)
                            //     request("http://boardgamegeek.com/xmlapi2/thread?id=" + thread.id,function(err,response,body){
                            //         // console.log(parser.toJson(body,options))
                            //         thread.articles = parser.toJson(body,options).thread.articles.article
                            //         forum.threads.push(thread);
                            //         callback(null)
                            //     })
                            // },function(err){
                            //     arg.items.item.forums.push(forum);
                            //     callback(null);

                            // })
                            // console.log(forum.threads)
                            arg.items.item.forums.push(forum);
                            callback(null);

                        })
                    },function(err){
                        arg.items.item.forums.sort(function(a,b){
                            if (a.title > b.title)
                              return 1;
                            if (a.title < b.title)
                              return -1;
                            // a must be equal to b
                            return 0;
                        })
                        // console.log(arg.items.item.forums)
                        callback(null,arg)
                    })
                    // var list = []
                    // for(var i = 0; i < length-1; i++) {
                    //     var id = arg.items.item.forums[i].id
                    //     console.log(i)
                    //     list.push((function (callback) {
                    //         console.log(id)
                    //         request("http://boardgamegeek.com/xmlapi2/forum?id="+id,function(err,response,body){
                    //             var r = parser.toJson(body,options).forum.threads.thread;
                    //             callback(null, r);
                    //         })
                    //     }))
                    // }

                    // async.parallel(list, function(results){
                    //     console.log("done")
                    //     console.log(results)
                    // });

                    // request("http://boardgamegeek.com/xmlapi2/forum?id="+arg.items.item.forums[0].id,function(err,response,body){
                    //     arg.items.item.forums[0].threads = parser.toJson(body,options).forum.threads.thread;
                    //     callback(null, arg);
                    // })
                }
            ], function (err, result) {
                // console.log(result.items.item.forums[0].threads)
                res.send(result)   
            });
            // var uri = "http://www.boardgamegeek.com/xmlapi2/thing?id="+id+"&stats=1&comments=1&videos=1&pagesize=100"
            // request(uri, function(err,response,body){
            //     var x = parser.toJson(body,options)
            //     request("http://boardgamegeek.com/xmlapi2/forumlist?id="+id+"&type=thing",function(err,response,body){
            //         x.items.item.forums = parser.toJson(body,options)
            //         console.log(x)
            //     })
            //     console.log(x.items)
            //     res.send(x)
            // })
        };
        self.routes['/bgr/:id'] = function(req,res) {
            // console.log("bgr")
            id = req.params.id
            request("http://www.boardgamegeek.com/xmlapi2/thing?id="+id+"&stats=1", function(err,response,body){
                var options = {
                    object: false,
                    reversible: false,
                    coerce: true,
                    sanitize: false,
                    trim: false,
                    arrayNotation: false
                };
                res.send(parser.toJson(body,options))
            })
        };

        self.routes['/thread/:id'] = function(req,res) {
            request("http://boardgamegeek.com/xmlapi2/thread?id=" + req.params.id,function(err,response,body){
                var options = {
                    object: true,
                    reversible: false,
                    coerce: true,
                    sanitize: false,
                    trim: false,
                    arrayNotation: false
                };
                thread = parser.toJson(body,options).thread
                thread.articles = thread.articles.article
                // console.log(thread)
                res.send(thread)
            });
        };

        self.routes['/search/:str'] = function(req,res) {
            console.log("search")
            str = req.params.str
            request("http://www.boardgamegeek.com/xmlapi/search?search="+str, function(err,response,body){
                console.log("response")
                console.log(body)
                // res.send(parser.toJson(body))
                res.send({})
            })
        };

        self.routes['/data'] = function(req,res) {
            // console.log("here")
            // console.log(req.query)
            request("http://www.boardgamegeek.com/xmlapi2/hot?type=boardgame", function(err,response,body){
                res.send(parser.toJson(body))
            })


        };

        self.routes['/'] = function(req, res) {
            // console.log("there")
            // console.log(req.query)
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.configure(function () {
            self.app.use(express.static(path.join(__dirname, 'public')));
        });

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

