express = require('express')
requestRetry = require "requestretry"
RateLimiter = require('limiter').RateLimiter
limiter = new RateLimiter(1, 500); # at most 1 request every 100 ms

throttledRequest = ->
  requestArgs = arguments
  limiter.removeTokens 1, ->
    #request.apply(this, requestArgs);
    requestRetry.apply(this, requestArgs)
    return
  return
  
async   = require('async')
parser  = require('xml2json')
cache_manager = require('cache-manager')
memory_cache = cache_manager.caching({store: 'memory', max: 10000, ttl: 3000})
app     = express()

class App
  constructor: ->
    self = this
    @initialize()
    @start()
  setupVars: ->
    @ipaddress = process.env.OPENSHIFT_NODEJS_IP or process.env.IP
    @port      = process.env.OPENSHIFT_NODEJS_PORT or 8080
    console.log @ipaddress
    console.log @port
    if not @ipaddress?
      #  Log errors on OpenShift but continue w/ 127.0.0.1 - this
      #  allows us to run/test the app locally.
      console.warn 'No OPENSHIFT_NODEJS_IP var, using 127.0.0.1'
      @ipaddress = "127.0.0.1"
    return
      
  terminator: (sig) ->
    if typeof sig is "string"
      console.log('%s: Received %s - terminating sample app ...',
                 Date(Date.now()), sig)
      process.exit(1)
    console.log('%s: Node server stopped.', Date(Date.now()) )
    return

  setupTerminationHandlers: ->
    #  Process on exit and signals.
    process.on 'exit', =>
      @terminator()
      return
    # Removed 'SIGPIPE' from the list - bugz 852598.
    for sig in ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
                'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM']
      process.on sig, =>
        @terminator(sig)
        return
    return
  
  createRoutes: ->
    jsonOptions =
      object        : true
      reversible    : false
      coerce        : true
      sanitize      : false
      trim          : false
      arrayNotation : false
      
    a_request = (url,res,cb) ->
      console.log url
      memory_cache.get url,(err, result) ->
        if result
          console.log 'cached_A'
          cb result
          return
        opts =
          maxAttempts     : 3
          retryDelay      : 500
          retryStrategy   : requestRetry.RetryStrategies.HTTPOrNetworkError 
          url             : url
        throttledRequest opts, (err,response,body) ->
          if err
            console.log "Error"
            console.log err
            res.end()
            return
            #throw err
          try
            result = parser.toJson(body,jsonOptions)
            if result.forums?
              result = result.forums.forum
            else if result.threads?
              result = result.threads.thread
            else
              result = result.items.item
            memory_cache.set(url, result)
            cb result
            return
          catch error
            console.log error
            #res.end()
          return
        return
      return
      
    _request = (url,res) ->
      console.log url
      cb = (result) ->
        #res.set('Cache-Control', 'public, max-age=3000')
        res.send result
        return
      memory_cache.get url,(err, result) ->
        if result
          console.log 'cached'
          cb result
          return
        #console.log 'hitting'
        opts =
          maxAttempts     : 3
          retryDelay      : 500
          retryStrategy   : requestRetry.RetryStrategies.HTTPOrNetworkError 
          url             : url
        throttledRequest opts, (err,response,body) ->
          if err
            console.log error
            res.end()
            return
            #throw err
          try
            result = parser.toJson(body,jsonOptions)
            if result.forums?
              result = result.forums.forum
            else if result.forum?
              result = result.forum.threads.thread
            else
              result = result.items.item
            memory_cache.set(url, result)
            cb result
          catch error
            console.log error
            #res.end()
          return
        return
      return
      
    @routes = {}
    
    @routes['/reviews/:id'] = (req,res) ->
      id = req.params.id
      a_request("http://boardgamegeek.com/xmlapi2/forumlist?id=#{id}&type=thing",res,(list) ->
        forumid = forum.id for forum in list when forum.title.toLowerCase() is "reviews"
        console.log "about to _request"
        _request("http://boardgamegeek.com/xmlapi2/forum?id=#{forumid}&type=thing",res)
        return
      )
      return
    
    @routes['/thing'] = (req,res) ->
      #console.log 'bg'
      #console.log req.originalUrl
      _request("http://www.boardgamegeek.com/xmlapi2#{req.originalUrl}",res)
      #request "http://www.boardgamegeek.com/xmlapi2#{req.originalUrl}", (err,response,body) ->
        #try
          #result = parser.toJson(body,jsonOptions)
          #result = result?.items?.item
        #catch error
          #res.end()
          #return
        #res.send(result)
        #return
      return
    
    @routes['/search'] = (req,res) ->
      console.log 'search'
      console.log req.originalUrl
      _request("http://www.boardgamegeek.com/xmlapi2#{req.originalUrl}",res)
      #request "http://www.boardgamegeek.com/xmlapi2#{req.originalUrl}", (err,response,body) ->
        #result = parser.toJson(body,jsonOptions).items.item
        ##result.items = result.items.item
        #res.send(result)
        #return
      return
      
    @routes['/hot'] = (req,res) ->
      console.log 'hot'
      _request("http://www.boardgamegeek.com/xmlapi2/hot?type=boardgame",res)
      #request "http://www.boardgamegeek.com/xmlapi2/hot?type=boardgame", (err,response,body) ->
        #result = parser.toJson(body,jsonOptions)
        #result = result.items.item
        #value = cache.set( req.originalUrl, )
        #res.send(result)
        #return
      return
      
    @routes['/'] = (req,res) ->
      res.setHeader('Content-Type', 'text/html')
      res.send('index.html')
      return
    return
      
  initServer: ->
    @createRoutes()
    @app = express()
    #env = process.env.NODE_ENV || 'development';
    #if ('development' == env) 
      # configure stuff here
    @app.use(express.static(__dirname + ''));
      #return
    for r of @routes
      @app.get(r, @routes[r])
    return
      
  initialize: ->
    @setupVars()
    @setupTerminationHandlers()
    # Create the express server and routes.
    @initServer();
    return
    
  start: ->
    @app.listen @port,@ipaddress, =>
      console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), @ipaddress, @port)
      return
    return

zapp = new App()