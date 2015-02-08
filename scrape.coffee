casper = require('casper').create({
    pageSettings: {
        loadImages:  false,
        loadPlugins: false         
    }})
fs = require('fs')
reType = /boardgamegeek.com\/(.*)\/browse/
types = ['partygames','abstracts','cgs','childrensgames','familygames','strategygames','thematic','wargames']
urls = ('http://www.boardgamegeek.com/' + type + '/browse/boardgame' for type in types)
urls.push('http://boardgamegeek.com/browse/boardgame')
data = {date:new Date().toJSON().slice(0,10)}

casper.start().each urls, (self, url) ->
    self.thenOpen url, ->
        ids = @evaluate getIds
        type = reType.exec(url)
        type = if type? then type[1] else "boardgame"
        data[type] = ids
        @echo "pass"
    

getIds = ->
  re = /\/boardgame\/(.*)\//
  ids = (e.getAttribute("href").match(re)[1] for e in document.querySelectorAll "td.collection_objectname a")

casper.run ->
    fs.write('json/top100.json', JSON.stringify(data), 'w')
    @echo("done").exit()