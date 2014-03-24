
#console.log(stats)

# no native support for HTML5 storage :(
# maybe try dojox.storage or a third-party solution

#cache the ids

# no native support for HTML5 storage :(
# maybe try dojox.storage or a third-party solution

#equalHeight($(".columns-equal > div"));

# no native support for HTML5 storage :(
# maybe try dojox.storage or a third-party solution

#routing
# Client-side routes    

$ ->
  $(document).foundation()
  ko.applyBindings new ViewModel()
  return

ViewModel = ->
  self = this
  self.searchedGames = ko.observableArray([])
  self.selectedGame = ko.observable()
  self.searching = ko.observable(null)
  sortDirection = -1
  currentSort = 'brating'

  #Sorting of search results
  self.sortByName = (direction) ->
    sortDirection = direction if direction?
    self.searchedGames.sort (a, b) ->
      return 1 * sortDirection  if self.getName(a.name) > self.getName(b.name)
      return -1 * sortDirection  if self.getName(a.name) < self.getName(b.name)
      0

    return

  self.sortByBRating = (direction) ->
    #direction = -1 is descending
    #direction = 1 is ascending
    console.log('sorting')
    sortDirection = direction if direction?
    self.searchedGames.sort (a, b) ->
      return 1 * sortDirection  if self.getBRating(a.statistics) > self.getBRating(b.statistics)
      return -1 * sortDirection  if self.getBRating(a.statistics) < self.getBRating(b.statistics)
      0

    return

  self.handleSort = (type,vm,event) ->
    #default to descending sort
    #unless clicked on the table header twice
    sortDirection = if type is currentSort then -sortDirection else -1
    currentSort = type
    self.updateTableHeaders(type, event)
    switch type
      when "name" then self.sortByName()
      when "brating" then self.sortByBRating()
    return

  self.updateTableHeaders = (type,event) ->
    $("#results-table thead tr th").removeClass "headerSortUp"
    $("#results-table thead tr th").removeClass "headerSortDown"
    if sortDirection is -1
      $(event.toElement).addClass "headerSortDown"
    else
      $(event.toElement).addClass "headerSortUp"
    return  

  #get information from boardgame object

  self.getGoodComments = (comments) ->
    gc = comments.comment.filter((el) ->
      el.value.length > 119 and parseInt(el.rating) > 0 and el.value.length < 600
    )
    gc[Math.floor(Math.random() * gc.length)]

  self.getRankLink = (name, id, value) ->
    return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value  if name is "boardgame"
    "http://boardgamegeek.com/" + name + "/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value

  self.getRanks = (stats) ->
    stats.ratings.ranks.rank

  self.getAverageRating = (stats) ->
    stats.ratings.average.value

  self.getBRating = (stats) ->
    stats.ratings.bayesaverage.value

  self.getCategoriesFromLinks = (link) ->
    categories = []
    i = 0

    while i < link.length
      categories.push link[i]["value"]  if link[i]["type"] is "boardgamecategory"
      i++
    categories

  self.getDesignerFromLinks = (link) ->
    i = 0

    while i < link.length
      return link[i]["value"]  if link[i]["type"] is "boardgamedesigner"
      i++
    return

  self.getName = (name) ->
    return name[0].value  if Array.isArray(name)
    name.value

  self.getShortDescription = (description) ->
    description.slice(0, 100) + "..."

  #utilities

  self.parseDescription = (description) ->
    paragraphs = 1
    contenthid = false
    regex = new RegExp("&#10;&#10;&#10;    ", "g")
    description = description.replace(regex, "<ul><li>")
    regex = new RegExp("&#10;&#10;&#10;", "g")
    description = description.replace(regex, "</li></ul>")
    regex = new RegExp("&#10;    ", "g")
    description = description.replace(regex, "</li><li>")
    description = "<p>" + description
    regex = new RegExp("&#10;&#10;", "g")
    description = description.replace(regex, "</p><p>")
    description += "</p>"
    i = 0

    while i < description.length
      if description.slice(i, i + 3) is "<p>" or description.slice(i - 5, i) is "</ul>"
        paragraphs += 1
        if (paragraphs > 3 and i > 600 and description.length - i > 7) and contenthid is false
          description = description.slice(0, i) + "<div class='full-description' style='display:none'>" + description.slice(i, description.length)
          contenthid = true
          break
      i++
    description += "</div><a onclick=$('.full-description').toggle(function(){$('.show-more').toggleClass('ion-chevron-up')});><i class='show-more icon ion-chevron-down'></i></a>"  if contenthid
    regex = new RegExp(self.getName(self.selectedGame().name), "g")
    description = description.replace(regex, "<b>" + self.getName(self.selectedGame().name) + "</b>")
    description

  self.searchGames = (str) ->
    self.searchedGames.removeAll()
    return  if str is ""
    regex = new RegExp(" ", "g")
    str = str.replace(regex, "+")
    self.searching true
    if Modernizr.sessionstorage
      ids = eval("(" + sessionStorage["searched_bg_ids_" + str] + ")")
      if ids
        self.getGamesDetails ids, str
        self.searching null
        return
    else

    url = "http://www.boardgamegeek.com/xmlapi/search?search=" + str
    $.getJSON self.getYQLurl(url), (data) ->
      ids = self.extractIdsFromSearch(data)
      sessionStorage["searched_bg_ids_" + str] = JSON.stringify(ids)
      self.getGamesDetails ids, str
      return

    return

  self.extractIdsFromSearch = (data) ->
    console.log data
    if data.query.results
      jdata = data.query.results.boardgames["boardgame"]
      ids = []
      if Array.isArray(jdata)
        i = 0

        while i < jdata.length
          ids.push jdata[i]["objectid"]
          i++
      else
        ids.push jdata["objectid"]
      ids

  self.getSomething = ->
    console.log "here"
    url = "http://www.boardgamegeek.com/boardgame/125618/libertalia"
    $.getJSON "http://query.yahooapis.com/v1/public/yql?" + "q=select%20*%20from%20html%20where%20url%3D%22" + encodeURIComponent(url) + "%22&format=xml'&callback=?", (data) ->
      console.log data
      return

    return

  self.getYQLurl = (str) ->
    q = "select * from xml where url="
    url = "'" + str + "'"
    "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(q + url) + "&format=json&callback=?"

  self.getGameDetails = (id) ->
    if Modernizr.sessionstorage
      gdata = eval("(" + sessionStorage["bg" + id] + ")")
      if gdata
        console.log "using cache"
        console.log gdata
        gdata["featuredComment"] = ko.observable()
        gdata.pickFeaturedComment = ->
          gdata.featuredComment(gdata.goodComments[Math.floor(Math.random() * gdata.goodComments.length)])
          return
        gdata.pickFeaturedComment()
        self.selectedGame gdata
        $("html, body").animate
          scrollTop: 0
        , "slow"
        return
    else

    url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1&comments=1"
    $.getJSON self.getYQLurl(url), (data) ->
      if data.query.results
        gdata = new ->
        for p of data.query.results.items["item"]
          gdata[p] = data.query.results.items["item"][p]
        gdata["thumbnail"] = ""  unless gdata["thumbnail"]?
        gdata["goodComments"] =   gdata.comments.comment.filter((el) ->
          el.value.length > 119 and parseInt(el.rating) > 0 and el.value.length < 600
        )
        gdata["featuredComment"] = ko.observable()
        gdata.pickFeaturedComment = ->
          gdata.featuredComment(gdata.goodComments[Math.floor(Math.random() * gdata.goodComments.length)])
          return
        gdata.pickFeaturedComment()
        sessionStorage["bg" + id] = ko.toJSON(gdata)
        self.selectedGame gdata
        $("html, body").animate
          scrollTop: 0
        , "slow"
      return

    return

  self.getGamesDetails = (gameids, str) ->
    if Modernizr.sessionstorage
      gdata = eval("(" + sessionStorage["searched_bgs_" + str] + ")")
      if gdata
        console.log "using cached search games"
        self.searching null
        self.searchedGames gdata
        #perform sort by rank
        self.sortByBRating(-1)
        return
    else

    counter = 0
    i = 0

    while i < gameids.length
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + gameids[i] + "&stats=1"
      $.getJSON self.getYQLurl(url), (data) ->
        counter += 1
        if data.query.results
          gdata = data.query.results.items["item"]
          gdata["thumbnail"] = ""  unless gdata["thumbnail"]?
          self.searchedGames.push gdata
        if counter is gameids.length
          self.searching null
          sessionStorage["searched_bgs_" + str] = JSON.stringify(self.searchedGames())
          #perform sort by rank
          self.sortByBRating(-1)
        return

      i++
    return

  self.goToSearch = ->
    str = encodeURIComponent($("#search").val())
    location.hash = "search/" + str
    return

  self.goToGame = (object) ->
    location.hash = "game/" + object.id
    return

  Sammy(->
    @get "#search/:string", ->
      self.selectedGame null
      self.searchGames @params.string
      return

    @get /#game\/(.*)(#.+)?/, ->
      console.log @params
      self.searchedGames.removeAll()
      self.getGameDetails @params.splat[0]
      return

    @get "", ->

    return
  ).run()
  return