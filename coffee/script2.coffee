#Code Convetions

#---------------------------------------------------------------------------------------------------
#https://github.com/polarmobile/coffeescript-style-guide

#---------------------------------------------------------------------------------------------------

#Use spaces only, with 2 spaces per indentation level. Never mix tabs and spaces.

#---------------------------------------------------------------------------------------------------

#Always surround these binary operators with a single space on either side
# assignment: =
# augmented assignment: +=, -=, etc.
# comparisons: ==, <, >, <=, >=, unless, etc.
# arithmetic operators: +, -, *, /, etc.

#---------------------------------------------------------------------------------------------------

# Use camelCase (with a leading lowercase character) to name all variables, methods, and object properties.
# Use CamelCase (with a leading uppercase character) to name all classes.

#---------------------------------------------------------------------------------------------------

# When declaring a function that takes arguments, always use a single space after the closing parenthesis of the arguments list:
# foo = (arg1, arg2) -> # Yes
# foo = (arg1, arg2)-> # No

#---------------------------------------------------------------------------------------------------

# Take advantage of comprehensions whenever possible:

#   # Yes
#   result = (item.name for item in array)

#   # No
#   results = []
#   for item in array
#     results.push item.name

# To filter:

# result = (item for item in array when item.name is "test")

# To iterate over the keys and values of objects:

# object = one: 1, two: 2
# alert("#{key} = #{value}") for key, value of object

#---------------------------------------------------------------------------------------------------

# Annotation types:

#     TODO: describe missing functionality that should be added at a later date
#     FIXME: describe broken code that must be fixed
#     OPTIMIZE: describe code that is inefficient and may become a bottleneck
#     HACK: describe the use of a questionable (or ingenious) coding practice
#     REVIEW: describe code that should be reviewed to confirm implementation

#---------------------------------------------------------------------------------------------------

$ ->
  $(document).foundation()
  ko.applyBindings new ViewModel()
  return

ViewModel = ->
  self = this
  self.searchedGames = ko.observableArray([])
  self.selectedGame = ko.observable()
  # Indicates that information is currently loading
  self.searching = ko.observable(null)
  # 1 is ascending, -1 is descending
  sortDirection = -1
  currentSort = 'brating'

  # Sorting of search results by name/title
  # direction [Number] (1 is ascending, -1 is descending) OPTIONAL
  self.sortByName = (direction) ->
    sortDirection = direction if direction?
    self.searchedGames.sort (a, b) ->
      return 1 * sortDirection  if self.getName(a.name) > self.getName(b.name)
      return -1 * sortDirection  if self.getName(a.name) < self.getName(b.name)
      0

    return

  # Sorting of search results by bayes rating
  # direction [Number] (1 is ascending, -1 is descending) OPTIONAL
  self.sortByBRating = (direction) ->
    sortDirection = direction if direction?
    self.searchedGames.sort (a, b) ->
      return 1 * sortDirection  if self.getBRating(a.statistics) > self.getBRating(b.statistics)
      return -1 * sortDirection  if self.getBRating(a.statistics) < self.getBRating(b.statistics)
      0

    return
  # Invoked when user clicks on a table header of search results
  # Calls appropriate sort method 
  # Calls method to update icons representing sort direction
  # type [String] (name,brating)
  # vm [ViewModel]
  # event [jQueryEvent]
  self.handleSort = (type,vm,event) ->
    #default to descending sort
    #unless already sorted by the same type
    sortDirection = if type is currentSort then -sortDirection else -1
    currentSort = type
    self.updateTableHeaders(type, event)
    switch type
      when "name" then self.sortByName()
      when "brating" then self.sortByBRating()
    return
  # Updates sort direction icons
  # type [String] (name,brating)
  # event [jQueryEvent]
  self.updateTableHeaders = (type,event) ->
    $("#results-table thead tr th").removeClass "headerSortUp"
    $("#results-table thead tr th").removeClass "headerSortDown"
    if sortDirection is -1
      $(event.toElement).addClass "headerSortDown"
    else
      $(event.toElement).addClass "headerSortUp"
    return  

  # get information from boardgame object

  # Returns link to bgg rank page for given rank
  # name [String] (type of rank/game)
  # id [String] (id of the rank)
  # value [String] (rank value)
  self.getRankLink = (name, id, value) ->
    return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=#{id}&rank=#{value}##{value}"  if name is "boardgame"
    return "http://boardgamegeek.com/#{name}/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=#{id}&rank=#{value}##{value}"

  # Returns all the ranks a boardgame has
  # stats [Object]
  self.getRanks = (stats) ->
    stats.ratings.ranks.rank

  # Returns average rating of a boardgame
  # stats [Object]
  self.getAverageRating = (stats) ->
    stats.ratings.average.value

  # Returns Bayes Rating of boardgame
  # stats [Object]
  self.getBRating = (stats) ->
    stats.ratings.bayesaverage.value

  # Returns all the categories of a boardgame
  # links [Array]
  self.getCategoriesFromLinks = (links) ->
    # [Array]
    categories = []
    for link in links
      categories.push(link["value"])  if link["type"] is "boardgamecategory"
    return categories

  # Returns the designer of a boardgame
  # links [Array]
  self.getDesignerFromLinks = (link) ->

    for link in links
      return link["value"]  if link["type"] is "boardgamedesigner"
    return

  # Returns the primary name of a boardgame
  # name [Array or String]
  self.getName = (name) ->
    return name[0].value  if Array.isArray(name)
    name.value

  # Returns shorted description of a boardgame
  # description [String]
  self.getShortDescription = (description) ->
    description.slice(0, 100) + "..."

  # utilities

  # Returns the html of description string
  # description [String]
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
      # Count the number of paragraphs
      # Unordered lists count as paragraphs
      if description.slice(i, i + 3) is "<p>" or description.slice(i - 5, i) is "</ul>"
        paragraphs += 1
        # If past the defined limit of characters or paragraphs
        # hide the rest of the description
        if (paragraphs > 3 and i > 600 and description.length - i > 7) and contenthid is false
          description = description.slice(0, i) + "<div class='full-description' style='display:none'>" + description.slice(i, description.length)
          contenthid = true
          break
      i++
    # Add a button to show the hidden part of the description
    description += "</div><a onclick=$('.full-description').toggle(function(){$('.show-more').toggleClass('ion-chevron-up')});><i class='show-more icon ion-chevron-down'></i></a>"  if contenthid
    regex = new RegExp(self.getName(self.selectedGame().name), "g")
    description = description.replace(regex, "<b>" + self.getName(self.selectedGame().name) + "</b>")
    return description

  # Searches games that match input string
  # str [String]
  self.searchGames = (str) ->
    # Clear previous search results
    self.searchedGames.removeAll()
    # Do nothing if no characters are entered
    return  if str is ""

    regex = new RegExp(" ", "g")
    str = str.replace(regex, "+")

    self.searching(true)

    # Check if results are already cached
    if Modernizr.sessionstorage
      ids = eval("(" + sessionStorage["searched_bg_ids_#{str}"] + ")")
      if ids
        self.getGamesDetails(ids, str)
        self.searching(null)
        return

    url = "http://www.boardgamegeek.com/xmlapi/search?search=#{str}"
    $.getJSON self.getYQLurl(url), (data) ->
      # [Array]
      ids = self.extractIdsFromSearch(data)
      sessionStorage["searched_bg_ids_#{str}"] = JSON.stringify(ids)
      self.getGamesDetails(ids, str)
      return

    return

  # Returns the list of ids of the boardgames that match the search string
  # data [Object]
  self.extractIdsFromSearch = (data) ->
    console.log data
    if data.query.results
      # [Array] or Object
      jdata = data.query.results.boardgames["boardgame"]
      # [Array]
      ids = []
      if Array.isArray(jdata)
        for object in jdata
          ids.push(object["objectid"])
      else
        ids.push(jdata["objectid"])
      return ids

  self.getSomething = ->
    console.log "here"
    url = "http://www.boardgamegeek.com/boardgame/125618/libertalia"
    $.getJSON "http://query.yahooapis.com/v1/public/yql?" + "q=select%20*%20from%20html%20where%20url%3D%22" + encodeURIComponent(url) + "%22&format=xml'&callback=?", (data) ->
      console.log data
      return

    return

  # Returns the YQL query
  # str [String]
  self.getYQLurl = (str) ->
    q = "select * from xml where url="
    url = "'#{str}'"
    return "http://query.yahooapis.com/v1/public/yql?q=#{encodeURIComponent(q + url)}&format=json&callback=?"

  # Loads data for a given boardgame id
  # id [String]
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

  # Client-side routes   

  Sammy(->
    @get "#search/:string", ->
      self.selectedGame null
      self.searchGames @params.string
      return

    @get /#game\/(.*)(#.+)?/, ->
      self.searchedGames.removeAll()
      self.getGameDetails @params.splat[0]
      return

    @get "", ->

    return
  ).run()
  return