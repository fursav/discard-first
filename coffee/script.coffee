# Code Convetions

#---------------------------------------------------------------------------------------------------
# https://github.com/polarmobile/coffeescript-style-guide

#---------------------------------------------------------------------------------------------------

# Use spaces only, with 2 spaces per indentation level. Never mix tabs and spaces.

#---------------------------------------------------------------------------------------------------

# Always surround these binary operators with a single space on either side
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
  # $(document).foundation()
  nav = responsiveNav(".nav-collapse",
    animate: true
    transition: 284
    label: ""
    )
  $("#nav").onePageNav({currentClass:"active"})
  window.vm = new ViewModel()
  ko.applyBindings window.vm
  if not ((Modernizr.flexbox or Modernizr.flexboxlegacy) and Modernizr.mq('only all'))
    alert = "<h4 class='alert-title'>Unsupported Browser</h4> You are using an unsupported browser!" +
      " Majority of the site features will be broken. It is recommended that you upgrade your browser." +
      "<p><strong>Supported Browsers:</strong></p>Opera 12.1+, Firefox 22+, Chrome 21+, Safari 6.1+."
    vex.dialog.alert alert
  return
  


saveToCache = (type,key,data) ->
  if Modernizr.sessionstorage
    sessionStorage["#{type}_#{key}"] = ko.toJSON(data)
  return
loadFromCache = (type,key) ->
  if Modernizr.sessionstorage
    data = sessionStorage["#{type}_#{key}"]
    data = JSON.parse(data) if data
    return data
  return

class BoardGame
  constructor: (data) ->
    # from search api
    @id = ""
    @image = ko.observable()
    @description = ko.observable()
    @thumbnail = ko.observable()
    @link = ko.observable()
    @maxplayers = ko.observable()
    @minage = ko.observable()
    @minplayers = ko.observable()
    @name = ko.observable()
    @playingtime = ko.observable()
    @statistics = ko.observable()
    @yearpublished = ko.observable()
    # hot rank
    @rank  = ko.observable()
    @dataInfo = {}
    
    # from board game api
    #[Array]
    @comments = []
    #[Object]
    @commentsData = {}
    #[Array]
    #@videos = ko.observableArray([])
    #[Array]
    @forums = []
    @selectedForum = ko.observable()
    @selectedThread = ko.observable()
    @featuredComment = ko.observable()
    @updated = ko.observable()
    @updateData(data)
      #console.log k
    #@pickFeaturedComment()
#
  #pickFeaturedComment: ->
      #@featuredComment(@goodComments[Math.floor(Math.random() * @goodComments.length)])
      #return
      
  updateData: (data) ->
    updateProp = (prop,propData) ->
      prop(propData) if propData
      return
    @id = data.id ? @id
    updateProp(@image,data.image)
    updateProp(@description,data.description)
    #@image = data.image ? @image
    #@description = data.description ? @description
    @thumbnail((if $.type(data.thumbnail) is "object" then data.thumbnail.value else data.thumbnail) ? @thumbnail)
    updateProp(@link,data.link)
    #@link = data.link ? @link
    updateProp(@maxplayers,data.maxplayers)
    #@maxplayers = data.maxplayers ? @maxplayers
    updateProp(@minage,data.minage)
    #@minage = data.minage ? @minage
    updateProp(@minplayers,data.minplayers)
    #@minplayers = data.minplayers ? @minplayers
    #@name = data.name ? @name
    updateProp(@name,data.name)
    updateProp(@playingtime,data.playingtime)
    #@playingtime = data.playingtime ? @playingtime
    updateProp(@statistics,data.statistics)
    #@statistics = data.statistics ? @statistics
    updateProp(@yearpublished,data.yearpublished)
    #@yearpublished = data.yearpublished ? @yearpublished
    updateProp(@rank,data.rank)
    #@rank  = data.rank ? @rank
    @comments = data.comments ? @comments
    @commentsData = data.commentsData ? @commentsData
    @forums = data.forums ? @forums
    for k,v of data.dataInfo
      @dataInfo[k] = v
      
    @updated(Date.now())
    @cacheData()
    
  getData: ->
    "id":@id
    "image":@image()
    "description":@description()
    "thumbnail":@thumbnail()
    "link":@link()
    "maxplayers":@maxplayers()
    "minage":@minage()
    "minplayers":@minplayers()
    "name":@name()
    "playingtime":@playingtime()
    "statistics":@statistics()
    "yearpublished":@yearpublished()
    "rank":@rank()
    "comments":@comments
    "commentsData":@commentsData
    "forums":@forums
    "dataInfo":@dataInfo
    "updated":@updated()
    
  cacheData: ->
    saveToCache("boardgame",@id,
    @getData()
    )

  # Returns all the ranks of a boardgame
  getRanks: ->
    @statistics().ratings.ranks.rank

  getRank: (name) ->
    console.log name
    parseInt(rank.value) for rank in @getRanks() when rank.name is name

  getTopRank: ->
    parseInt(rank.value) for rank in @getRanks() when rank.name is "boardgame"

  # Returns average rating of a boardgame
  getAverageRating: ->
    @statistics()?.ratings?.average?.value

  # Returns Bayes Rating of boardgame
  getBRating: ->
    @statistics()?.ratings?.bayesaverage?.value

  # Returns all the categories of a boardgame
  getCategories: ->
    # [Array]
    categories = []
    for link in @link()
      categories.push(link["value"])  if link["type"] is "boardgamecategory"
    return categories

  # Returns the designer of a boardgame
  getDesigner: ->
    for link in @link()
      return link["value"]  if link["type"] is "boardgamedesigner"
    return

  getNumPlayers: ->
    if @maxplayers().value is @minplayers().value
      return @maxplayers().value
    else
      return "#{@minplayers().value} - #{@maxplayers().value}"

  # Returns the primary name of a boardgame
  getName: ->
    return @name()[0].value if $.type(@name()) is "array"
    @name().value

  getShortName: ->
    list = @getName().split('(')[0].split('–')[0].split(' ')
    if list.length > 3
      list = list[0..2]
      list.push('...')
      return list.join(' ')
    return list.join(' ')

  # Returns shorted description of a boardgame
  getShortDescription: ->
    @description().slice(0, 100) + "..."

  # Returns the html of description string
  getHTMLDescription: ->
    paragraphs = 1
    contenthid = false
    # console.log(@description)
    # [String]
    htmlDescription = @description()
    # console.log htmlDescription

    regex = new RegExp("&#10;&#10;    ", "g")
    htmlDescription = htmlDescription.replace(regex, "<ul><li>")


    regex = new RegExp("&#10;&#10;&#10;", "g")
    htmlDescription = htmlDescription.replace(regex, "</li></ul>")

    regex = new RegExp("&#10;    ", "g")
    htmlDescription = htmlDescription.replace(regex, "</li><li>")

    htmlDescription = "<p>" + htmlDescription

    regex = new RegExp("&#10;&#10;", "g")
    htmlDescription = htmlDescription.replace(regex, "</p><p>")

    htmlDescription += "</p>"
    # console.log htmlDescription
    i = 0

    while i < htmlDescription.length
      # Count the number of paragraphs
      # Unordered lists count as paragraphs
      if htmlDescription.slice(i, i + 3) is "<p>" or htmlDescription.slice(i - 5, i) is "</ul>"
        paragraphs += 1
        # If past the defined limit of characters or paragraphs
        # hide the rest of the description
        if (paragraphs > 3 and i > 600 and htmlDescription.length - i > 7) and contenthid is false
          htmlDescription = htmlDescription.slice(0, i) + "<div class='full-description' style='display:none'>" + htmlDescription.slice(i, htmlDescription.length)
          contenthid = true
          break
      i++
    # Add a button to show the hidden part of the description
    htmlDescription += "</div><button class='link link-wide' onclick=$('.full-description').toggle(function(){$('.show-more').toggleClass('ion-chevron-up')});><i class='show-more icon ion-chevron-down icon-large'></i></button>"  if contenthid
    regex = new RegExp(@getName(), "g")
    htmlDescription = htmlDescription.replace(regex, "<b>" + @getName() + "</b>")
    return htmlDescription


  # Returns link to bgg rank page for given rank
  # @param name [String] type of rank/game
  # @param id [String] id of the rank
  # @param value [String] rank value
  getRankLink: (name, id, value) ->
    return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=#{id}&rank=#{value}##{value}"  if name is "boardgame"
    return "http://boardgamegeek.com/#{name}/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=#{id}&rank=#{value}##{value}"

  selectForum: (forum) =>
    console.log "select forum"
    @selectedForum forum
    return

  deselectForum: =>
    @selectedForum null
    return
  selectThread: (thread) =>
    console.log "select thread"
    $.getJSON "thread/#{thread.id}", (data) =>
      console.log data
      @selectedThread(data)
      # window.onload(->
      #   )
      $(document).ready(->
        $('.thread-title').waypoint('sticky')
        $('.thread-title').css("width", $('.thread-title').outerWidth())
        $('html, body').animate({
          scrollTop: $('#forums').offset().top
        }, 300)
        return
        )
      return
    return

  getThreadPost: (articles) =>
    return if articles[0]? then articles[0].body else articles.body

  deselectThread: =>
    @selectedThread null
    $('html, body').animate({
      scrollTop: $('#forums').offset().top
    }, 300)
    return

  getForumVisible: =>
    # console.log @selectForum()
    # console.log @selectThread()
    if @selectedForum() and not @selectedThread()
      return true
    return false

class ViewModel
  constructor: ->
    self = this

    # Indicates that information is currently loading
    @loading = ko.observable(null)
    # 1 is ascending, -1 is descending
    @sortDirection = -1
    @currentSort = 'brating'
    @gameTypes = [{key:'boardgame',name:"Overall"},{key:'partygames',name:'Party'},
                  {key:'abstracts',name:'Abstract'},{key:'cgs',name:'Customizable'},
                  {key:'childrensgames',name:"Children"},{key:'familygames',name:'Family'},
                  {key:'strategygames',name:'Strategy'},{key:'thematic',name:'Thematic'},
                  {key:'wargames',name:'War'}]

    # Page
    @currentPage = ko.observable()
    @currentPageTitle = ko.computed(=>
      return switch @currentPage()
        when "searchGames" then 'Search Results'
        when "gameComments" then  'Game Comments'
        when "gameOverview" then 'Game Overview'
        when "hotGames" then ''
        when "topGames" then 'Top Games'
      )
    
    @boardGames = {"updated":ko.observable()}
    # [Array]
    @searchedGames = ko.observableArray([])
    @searchedGamesList = ko.computed =>
      # introduced this to dependency to refresh when finished loading
      #@loading()
      @boardGames.updated()
      list = []
      for id in @searchedGames()
        if @boardGames[id]?
          list.push @boardGames[id]
      #console.log list.sort().reverse()
      #list = @sortList(list,"boardgame")
      console.log list
      list.sort((a,b) ->
        return 1 if a.getBRating() < b.getBRating()
        return -1 if a.getBRating() > b.getBRating()
        return 0
        )
      list
      #console.log(@boardGames[id] for id in @searchedGames() if @boardGames[id]?)
      #@boardGames[id] for id in @searchedGames() if @boardGames[id]?
    #.extend({ notify: 'always' })
    # [Array]
    @hotGames = ko.observableArray([])

    @topGamesType = ko.observable()
    @topGames = ko.observableArray([])
    @dataTimeStamp = ko.observable()
    $.getJSON 'json/top100.json', (data) =>
      @dataTimeStamp data.date
    # [BoardGame]
    @selectedGame = ko.observable()
    # Client-side routes
    Sammy(->
      @get /#search\/(.*)/, ->
          self.selectedGame null
          self.searchGames @params.splat[0]
          self.currentPage "searchGames"
          return

      @get /#game\/(\w*)$/, ->
        self.currentPage "gameOverview"
        self.searchedGames.removeAll()
        self.getGameDetails @params.splat[0]
        return

      @get /#game\/(\w*)\/comments\/page\/(\w*)/, ->
        self.getGameDetails(@params.splat[0], @params.splat[1])
        self.currentPage "gameComments"
        #elf.getGameComments(@params.oid, @params.num)
        return

      @get "#topgames/:gameType", ->
        self.topGamesType(@params.gameType)
        self.selectedGame null
        self.searchedGames.removeAll()
        self.topGames.removeAll()
        self.getTopGames(@params.gameType)
        self.currentPage "topGames"
        return

      @get "", ->
        this.title = "Hello"
        self.selectedGame null
        self.searchedGames.removeAll()
        self.getHotItems()
        self.currentPage "hotGames"
        return

      @get "/", ->
        console.log "dead"
        return

      return
    ).run()

  goToGameComments: =>
    x = @selectedGame().commentsPage()
    location.hash = "game/#{@selectedGame().id}/comments/page/#{x}"
    $("html, body").animate
          scrollTop: 0
        , "slow"
    return

  # goToGameForums: =>
  #   x = @selectedGame().selectedThread().
  #   location.hash = "game/#{@selectedGame().id}/comments/page/#{x}"
  #   $("html, body").animate
  #         scrollTop: 0
  #       , "slow"
  #   return

  goToSearch: ->
    str = encodeURIComponent($("#search").val())
    location.hash = "search/" + str
    return

  # @param object [Object] boardgame object
  goToGame: (object) =>
    #@currentPage ""
    location.hash = "game/" + object.id
    $("html, body").animate
          scrollTop: 0
        , "slow"
    return

  sortColumn: (object,event) =>
    # console.log event
    th = $(event.target)
    $table = th.closest("table")
    thIndex = th.index()
    trs = $table.children("tbody").children("tr")
    column = []
    # if current sort is descending
    # then change it to ascending
    # descending -1 is the default sort
    sortDir = if th.hasClass("sorting-desc") then 1 else -1
    type = th.data("sort")
    trs.each((index,tr) ->
      $e = $(tr).children().eq(thIndex)
      sort_val = $e.data("sort-value")
      order_by = if typeof(sort_val) is not "undefined" then sort_val else $e.text()
      column.push([order_by, tr])
      return
    )
    # Sort by the data-order-by value
    column.sort((a, b) =>
      switch type
        when "float"
          sortDir * (parseFloat(a[0], 10) - parseFloat(b[0], 10))
        when "int"
          sortDir * (parseInt(a[0], 10) - parseInt(b[0], 10))
        when "date"
          date1 = if a[0] is "0" then 0 else @getIntFromDate(a[0])
          date2 = if b[0] is "0" then 0 else @getIntFromDate(b[0])
          sortDir * (date1 - date2)
        else
          if a[0] < b[0]
            return sortDir * -1
          if a[0] > b[0]
            return sortDir
          return 0
      )
    trs = $.map(column, (kv) ->
      kv[1]
      )
    $table.children("tbody").append(trs)
    th.siblings().removeClass("sorting-desc sorting-asc")
    th.removeClass("sorting-desc sorting-asc")
    if sortDir is 1
      th.addClass("sorting-asc")
    else
      th.addClass('sorting-desc')
    return

  getIntFromDate: (date) =>
    parseInt(date.slice(-4) + @getNumFromMonth(date.slice(8,-5)) + date.slice(5,7),10)

  getNumFromMonth: (month) ->
    switch month.toLowerCase()
      when "jan" then "00"
      when "feb" then "01"
      when "mar" then "02"
      when "apr" then "03"
      when "may" then "04"
      when "jun" then "05"
      when "jul" then "06"
      when "aug" then "07"
      when "sep" then "08"
      when "oct" then "09"
      when "nov" then "10"
      when "dec" then "11"



  sortList: (list,type) ->
    list.sort (a, b) =>
      a_prop = parseInt(a.getRank(type))
      b_prop = parseInt(b.getRank(type))
      return 1  if a_prop > b_prop
      return -1  if a_prop < b_prop
      0

  # Sorting of search results by name/title
  # direction [Number] (1 is ascending, -1 is descending) OPTIONAL
  sortByName: (direction) ->
    @sortDirection = direction if direction?
    # a [BoardGameResult]
    # b [BoardGameResult]
    @searchedGames.sort (a, b) =>
      return 1 * @sortDirection  if a.getName() > b.getName()
      return -1 * @sortDirection  if a.getName() < b.getName()
      0

    return

  # Sorting of search results by bayes rating
  # direction [Number] (1 is ascending, -1 is descending) OPTIONAL
  sortByBRating: (direction) ->
    @sortDirection = direction if direction?
    @searchedGames.sort (a, b) =>
      return 1 * @sortDirection  if a.getBRating() > b.getBRating()
      return -1 * @sortDirection  if a.getBRating() < b.getBRating()
      0

    return
  # Invoked when user clicks on a table header of search results
  # Calls appropriate sort method
  # Calls method to update icons representing sort direction
  # @param type [String] (name,brating)
  # @param vm [ViewModel]
  # @param event [jQueryEvent]
  handleSort: (type,vm,event) ->
    #default to descending sort
    #unless already sorted by the same type
    @sortDirection = if type is @currentSort then -(@sortDirection) else -1
    @currentSort = type
    @updateTableHeaders(type, event)
    switch type
      when "name" then @sortByName()
      when "brating" then @sortByBRating()
    return

  # Updates sort direction icons
  # @param type [String] (name,brating)
  # @param event [jQueryEvent]
  updateTableHeaders: (type,event) =>
    $("#results-table thead tr th").removeClass "sorting-asc"
    $("#results-table thead tr th").removeClass "sorting-desc"
    if @sortDirection is -1
      $(event.toElement).addClass "sorting-desc"
    else
      $(event.toElement).addClass "sorting-asc"
    return

  # Searches games that match input string
  # @param str [String]
  searchGames: (str) ->
    # Clear previous search results
    @searchedGames.removeAll()
    # Do nothing if no characters are entered
    return null if str is ""
    
    regex = new RegExp(" ", "g")
    str = str.replace(regex, "+")
    str = encodeURI(str)
    console.log str

    @loading(true)

    # Check if results are already cached
    ids = loadFromCache("searched_bgs_ids", str)
    if ids
      console.log 'search from cache'
      console.log ids
      @getGamesDetails(ids, str)
      @searchedGames(ids)
      @loading null
      return

    $.getJSON "/search?type=boardgame&query=#{str}", (data) =>
      # [Array]
      ids = @extractIdsFromSearch(data)
      saveToCache("searched_bgs_ids", str, ids)
      @getGamesDetails(ids, str)
      @searchedGames(ids)
      return

    return

  # Returns the list of ids of the boardgames that match the search string
  # @param data [Object]
  extractIdsFromSearch: (data) ->
    console.log data
    if data
      #[Array]
      ids = []
      items = data.items
      if Array.isArray(items)
        for item in data.items
          ids.push(item?.id)
      else
        ids.push(items?.id)
      return ids

  getTopGames: (type) ->
    @loading(true)
    $.getJSON 'json/top100.json', (data) =>
      items = data[type]
      counter = 0

      for id in items
        bgdata = @loadFromCache("bgr", id)
        if bgdata
          counter += 1
          @topGames.push(new BoardGameResult(bgdata))
          if counter is items.length
            @loading null
        else
          url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1"
          $.getJSON "/bgr/#{id}", (data) =>
            counter += 1
            if data
              bgr = new BoardGameResult(data.items["item"])
              @topGames.push(bgr)
              @saveToCache("bgr",bgr.id, bgr)
            if counter is items.length
              @sortList(@topGames,@topGamesType())
              @loading null
              # @saveToCache("searched_bgs", str, @searchedGames())
              # @sortByBRating(-1)
            return
    return
    
  parseData: (data) ->
    if not data?
      return
    console.log data.id
    if @boardGames[data.id]?
      #olddata = @boardGames[data.id].getData()
      #if olddata is not data
      @boardGames[data.id].updateData(data)
      data = @boardGames[data.id].getData()
      #else
        #return
      #@boardGames.updated(Date.now())
      #return
    @boardGames[data.id] = new BoardGame(data)
    @boardGames.updated(Date.now())
    return

  getHotItems: ->
    @loading(true)
    data = @loadFromCache("hot", "games")
    if data
      @hotGames(data)
      console.log data
      # assume the actual board game data is still in cache if list of hot games has been cached
      for id in data
        if not @boardGames[id]?
          console.log id
          @boardGames[id] = new BoardGame(@loadFromCache("boardgame", id))
      @loading(null)
      return
    $.getJSON 'hot', (data) =>
      if data
        #console.log (new BoardGameResult(result) for result in data.query.results.items.item)
        for item in data.items
          item.dataInfo = 
            'hot':1
          @parseData(item) 
        @hotGames((item.id for item in data.items))
        @loading(null)
        @saveToCache("hot", "games", @hotGames())
      return
    return

  # Loads data for a given boardgame id
  # @param id [String]
  getGameDetails: (id,page) ->
    @loading(true)
    if page
      $.getJSON "bg/#{id}/#{page}", (data) =>
        if data
          @selectedGame(new BoardGame(data.items["item"]))
          @loading(null)
          subnav = $('#sub-nav').onePageNav({
            currentClass: 'active'
            })
        return
      return
    page ?= 1
    data = @loadFromCache("bg", id)
    if data
      @selectedGame(new BoardGame(data))
      @loading(null)
      return

    url = "http://www.boardgamegeek.com/xmlapi2/thing?id=#{id}&stats=1&comments=1&pagesize=100&page=#{page}"
    $.getJSON "/thing?id=#{id}&stats=1", (data) =>
      if data
        @selectedGame(new BoardGame(data.items["item"]))
        @loading(null)
        subnav = $('#sub-nav').onePageNav({
          currentClass: 'active'
          })
        @saveToCache("bg", {'query':id}, @selectedGame())
      return
    return

  getGamesDetails: (ids) ->
    query = 
      'stats':1
      #'comments':1
      #'pagesize':100
      #'page':1
    @loading(true)
    console.log 'getGamesDetails'
    lookupids = []
    for id in ids
      if @needToRetrieveData(id,query)
        lookupids.push(id)
      #if not id?
        #continue
      #if @boardGames[id]?
        #continue
      #cachedData = loadFromCache "boardgame",id
      #if cachedData
        #@parseData cachedData
      #else
        #lookupids.push(id)
    cnt = 0
    for id in lookupids
      cnt++
      #while cnt > 50
        #continue
      url = "/thing?id=#{id}"
      for k,v of query
        url += "&#{k}=#{v}"
      $.getJSON url, (data) =>
        cnt--
        if data
          data.datainfo = query
          @parseData data
        if cnt is 0
          @loading null
        return
    if lookupids.length is 0
      @loading null
    return
    
  needToRetrieveData: (id,dataInfo) ->
    if not id?
      return false
    # assume that cache does not have more
    # information than the object in memory
    if @boardGames[id]?
      di = @boardGames[id].dataInfo
      for k,v of dataInfo
    # TODO: check for other data types besides boolean
        if not di[k]?
          return true
      return false
    cachedData = loadFromCache "boardgame",id
    if not cachedData?
      return true
    for k,v of dataInfo
      if not cachedData[k]?
        return true
    @parseData cachedData
    return false

  #getGamesDetails: (ids) ->
    #@loading(true)
    #url = "/bgs/"
    #console.log 'getGamesDetails'
    #for id in ids
      #if not id?
        #continue
      #if @boardGames[id]?
        #continue
      #cachedData = loadFromCache "boardgame",id
      #if cachedData
        #@parseData cachedData
      #else
        #url += "#{id},"
    #url = url.slice(0,-1) if url.slice(-1) is ","
    #if url isnt "/bgs/"
      #$.getJSON url, (data) =>
        #if data
          #for bg in data.boardgames
            #@parseData bg
        #@loading null
        #return
    #else
      #@loading null
    #return

  saveToCache: (type,key,data) ->
    if Modernizr.sessionstorage
      sessionStorage["#{type}_#{key}"] = ko.toJSON(data)
    return
  loadFromCache: (type,key) ->
    if Modernizr.sessionstorage
      data = sessionStorage["#{type}_#{key}"]
      data = JSON.parse(data) if data
      return data
    return