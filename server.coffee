express = require('express')
path    = require('path')
request = require('request')
async   = require('async')
parser  = require('xml2json')
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
    @routes = {}
    
    @routes['/thing'] = (req,res) ->
      console.log 'bg'
      request "http://www.boardgamegeek.com/xmlapi2#{req.originalUrl}", (err,response,body) ->
        result = parser.toJson(body,jsonOptions)
        result = result?.items?.item
        #console.log result
        res.send(result)
        return
      return
    
    @routes['/search'] = (req,res) ->
      console.log 'search'
      console.log req.originalUrl
      request "http://www.boardgamegeek.com/xmlapi2#{req.originalUrl}", (err,response,body) ->
        result = parser.toJson(body,jsonOptions)
        result.items = result.items.item
        res.send(result)
        return
      return
      
    @routes['/hot'] = (req,res) ->
      console.log 'hot'
      request "http://www.boardgamegeek.com/xmlapi2/hot?type=boardgame", (err,response,body) ->
        result = parser.toJson(body,jsonOptions)
        result = result.items.item
        res.send(result)
        return
      return
      
    @routes['/'] = (req,res) ->
      res.setHeader('Content-Type', 'text/html')
      res.send('index.html')
      return
    return
      
  initServer: ->
    @createRoutes()
    @app = express()
    @app.configure =>
      #@app.use(express.static(path.join(__dirname, 'dist')))
      @app.use(express.static(path.join(__dirname, '')))
      return
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