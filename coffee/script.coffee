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

getIntFromDate =  (date) =>
  parseInt(date.slice(-4) + @getNumFromMonth(date.slice(8,-5)) + date.slice(5,7),10)

getNumFromMonth = (month) ->
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

sortColumn = (list,e,type,sortDir) ->
  th = $(e)
  $table = th.closest("table")
  thIndex = th.index()
  trs = $table.children("tbody").children("tr")
  column = []
  # if current sort is descending
  # then change it to ascending
  # descending -1 is the default sort
  if sortDir?
    sortDir = if sortDir is "asc" then 1 else -1
  sortDir ?= if th.hasClass("sorting-desc") then 1 else -1
  trs.each((index,tr) ->
    $e = $(tr).children().eq(thIndex)
    sort_val = $e.data("sort-value")
    order_by = if typeof(sort_val) is not "undefined" then sort_val else $e.text()
    column.push([order_by, index])
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
        date1 = if a[0] is "0" then 0 else getIntFromDate(a[0])
        date2 = if b[0] is "0" then 0 else getIntFromDate(b[0])
        sortDir * (date1 - date2)
      else
        if a[0] < b[0]
          return sortDir * -1
        if a[0] > b[0]
          return sortDir
        return 0
    )
  temp = $.map(column, (kv) ->
    list()[kv[1]]
    )
  list(temp)
  #$table.children("tbody").append(trs)
  th.siblings().removeClass("sorting-desc sorting-asc")
  th.removeClass("sorting-desc sorting-asc")
  if sortDir is 1
    th.addClass("sorting-asc")
  else
    th.addClass('sorting-desc')
  return


ko.bindingHandlers.sortable =
  init: (element, valueAccessor) ->
    # Change cursor to pointer on hover
    $("th[data-sort]", element).each ->
      $(this).addClass("clickable")
      return
    return

  update: (element, valueAccessor) ->
    value = valueAccessor()
    $("th[data-sort]", element).each ->
      $(this).removeClass("sorting-desc sorting-asc")
      $(this).click ->
        sortColumn(value,this,$(this).data("sort"))
        return
      return
    return
    
$ ->
  nav = responsiveNav(".nav-collapse",
    animate: true
    transition: 284
    label: ""
    closeOnNavClick: true
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
      prop(propData) if propData?
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
    @statistics()?.ratings?.ranks?.rank

  getRank: (name) ->
    return @getAverageRating() if name is "averageRating"
    return @getBRating() if name is "bayesRating"
    return "" if not @getRanks()?
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
    # [Array]
    @hotGames = ko.observableArray([])

    @topGamesType = ko.observable()
    @topGames = ko.observableArray([])
    @gamesList = ko.computed () =>
      list = []
      ids = switch @currentPage()
        when "topGames" then @topGames()
        when "hotGames" then @hotGames()
        when "searchGames" then @searchedGames()
        else []
      @boardGames.updated()
      for id in ids
        if @boardGames[id]?
          list.push @boardGames[id]
      list
      
    @dataTimeStamp = ko.observable()
    $.getJSON 'json/top100.json', (data) =>
      @dataTimeStamp data.date
    # [BoardGame]
    @selectedGame = ko.observable()
    # Client-side routes
    Sammy( ->
      @get /#search\/(.*)/, ->
          #self.selectedGame null
          self.searchGames @params.splat[0]
          self.currentPage "searchGames"
          return

      @get /#game\/(\w*)$/, ->
        self.getGameDetails @params.splat[0]
        self.currentPage "gameOverview"
        return

      @get /#game\/(\w*)\/comments\/page\/(\w*)/, ->
        self.getGameDetails(@params.splat[0], @params.splat[1])
        self.currentPage "gameComments"
        #elf.getGameComments(@params.oid, @params.num)
        return

      @get "#topgames/:gameType", ->
        self.topGamesType(@params.gameType)
        #self.selectedGame null
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

  sortList: (list,type,dir) ->
    dir ?= 1
    list.sort (a, b) =>
      a_prop = parseFloat(@boardGames[a].getRank(type))
      b_prop = parseFloat(@boardGames[b].getRank(type))
      return -1*dir  if a_prop > b_prop
      return dir  if a_prop < b_prop
      0

  # Searches games that match input string
  # @param str [String]
  searchGames: (str) ->
    processIds = (ids) =>
      @getGamesDetails(ids, =>
        @sortList(@searchedGames,"bayesRating")
        return
        )
      @searchedGames(ids)
      return
    # Clear previous search results
    @searchedGames.removeAll()
    # Do nothing if no characters are entered
    return null if str is ""
    
    regex = new RegExp(" ", "g")
    str = str.replace(regex, "+")
    str = encodeURI(str)

    # Check if results are already cached
    ids = loadFromCache("searched_bgs_ids", str)
    if ids
      processIds(ids)
      return
      
    @loading(true)
    $.getJSON "/search?type=boardgame&query=#{str}", (data) =>
      # [Array]
      ids = @extractIdsFromSearch(data)
      saveToCache("searched_bgs_ids", str, ids)
      processIds(ids)
      @loading(null)
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
        ids.push(items?.id) if items?.id?
      return ids

  getTopGames: (type) ->
    window.counter = Date.now()
    console.log 0
    processItems = (items) =>
      @topGames(items)
      @getGamesDetails(items,=>
        @sortList(@topGames,@topGamesType(),-1)
        console.log Date.now()-window.counter
        return
        )
      return
    @topGames.removeAll()
    # [Array]
    ids = loadFromCache("topgames", type)
    if ids
      processItems(ids)
      return
    @loading(true)
    $.getJSON 'json/top100.json', (data) =>
      ids = data[type]
      saveToCache("topgames", type, ids)
      processItems(ids)
      return
    return
    
  parseData: (data) ->
    if not data?
      return
    if @boardGames[data.id]?
      @boardGames[data.id].updateData(data)
      @boardGames.updated(Date.now())
      return
    @boardGames[data.id] = new BoardGame(data)
    @boardGames.updated(Date.now())
    return

  getHotItems: ->
    data = loadFromCache("hot", "games")
    if data
      @hotGames(data)
      # assume the actual board game data is still in cache if list of hot games has been cached
      for id in data
        @needToRetrieveData(id)
      return
    @loading(true)
    $.getJSON 'hot', (data) =>
      if data
        for item in data.items
          item.dataInfo = 
            'hot':1
          @parseData(item) 
        @hotGames((item.id for item in data.items))
        @loading(null)
        saveToCache("hot", "games", @hotGames())
      return
    return

  # Loads data for a given boardgame id
  # @param id [String]
  getGameDetails: (id,query) ->
    promise = new RSVP.Promise (resolve, reject) =>
      query ?= 
        'stats':1
        'comments':1
        'pagesize':100
        'page':page
      console.log 'getGameDetails'
      # @needToRetrieveData automatically loads data from cache
      if @needToRetrieveData(id,query)
        #@loading(true)
        url = "/thing?id=#{id}"
        for k,v of query
          url += "&#{k}=#{v}"
        $.getJSON url, (data) =>
          if data
            data.dataInfo = query
            @parseData data
          #@loading null
          resolve(true)
        return
      else
        resolve(true)
    return promise

  getGamesDetails: (ids,callback) ->
    query = 
      'stats':1
    @loading(true)
    console.log 'getGamesDetails'
    promises = ids.map (id) =>
      return @getGameDetails(id,query)
    RSVP.all(promises).then =>
      console.log "done"
      callback() if callback?
      @loading null
      return
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
      if not cachedData.dataInfo[k]?
        return true
    @parseData cachedData
    return false