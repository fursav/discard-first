# defines the layout of the page
util = {}  
    
util.getCategoryDisplay = (type) -> 
  console.log type
  {
    boardgame: 'All'
    partygames: 'Party'
    abstracts: 'Abstracts'
    cgs: 'Customizable'
    childrensgames: 'Children'
    familygames: 'Family'
    strategygames: 'Strategy'
    thematic: 'Thematic'
    wargames: 'War'
  }[type]
  
util.layout = (title, body) ->
  return m("#wrap", [
      util.header(title),
      util.nav(),
      m("main", body)
  ]);

util.topLayout = (category, body) ->
  return m("#wrap", [
      util.header(util.getCategoryDisplay(category),new Icon(".icon-large.ion-chevron-right")),
      util.nav(),
      util.topNav(category),
      m("main", body)
    ]);
    
util.gameLayout = (game, body) ->
  return m("#wrap", [
      util.header(game()?.name,new Icon(".icon-large.ion-chevron-right")),
      util.nav(),
      util.gameNav(game),
      m("main", body)
    ]);

util.header = (title,rightIcon) ->
  if rightIcon
    right = m("label.nav-btn",{for:"nav-secondary"},
          rightIcon)
  else
    right = ""
  return m("header.banner",
    [
      m("div.banner-left",
        m("label.nav-btn",{for:"nav-expand"},
          m("i.icon.icon-large.ion-navicon")
        )
      ),
      m("div.banner-center",title),
      m("div.banner-right",right)

    ])
    
util.topNav = ->
  closeNav = (e) ->
    document.getElementById("nav-secondary").checked = false
    return
  categories = ['boardgame','abstracts','cgs','childrensgames','familygames','partygames','strategygames','thematic','wargames']
  return [
    m("input#nav-secondary[name=nav][type=checkbox][checked=''].invisible"),
    m("nav.off-canvas-secondary",
      m("div.off-canvas-title.text-right",
        m("label[for=nav-secondary].nav-btn",
          m("i.icon.icon-large.ion-close")
        )
      ),
      m("ul.no-bullet.off-canvas-nav",{onclick: closeNav },
        categories.map((x) ->
          return m("li",m("a.clickable",{href:"/top/#{x}",config:m.route},util.getCategoryDisplay(x)))
        )
      )
    ),
    m("label[for=nav-secondary].overlay")
  ]

util.gameNav = (game) ->
  closeNav = (e) ->
    document.getElementById("nav-secondary").checked = false
    return
  return [
    m("input#nav-secondary[name=nav][type=checkbox][checked=''].invisible"),
    m("nav.off-canvas-secondary",
      m("div.off-canvas-title.text-right",
        m("label[for=nav-secondary].nav-btn",
          m("i.icon.icon-large.ion-close")
        )
      ),
      m("ul.no-bullet.off-canvas-nav",{onclick: closeNav },
        [
          m("li",m("a.clickable",{href:"/bg/#{game()?.id}",config:m.route},"Overview")),
          m("li",m("a.clickable",{href:"/bg/#{game()?.id}/details",config:m.route},"Details")),
          m("li",m("a.clickable",{href:"/bg/#{game()?.id}/stats",config:m.route},"Statistics")),
          m("li",m("a.clickable",{href:"/bg/#{game()?.id}/reviews",config:m.route},"Reviews"))
        ]
      )
    ),
    m("label[for=nav-secondary].overlay")
  ]

util.nav = ->
  closeNav = ->
    document.getElementById("nav-expand").checked = false
    m.route("/")
    return
  return [
    m("input#nav-expand[name=nav][type=checkbox][checked=''].invisible"),
    m("nav.off-canvas",
      m("div.off-canvas-title",
        m("label[for=nav-expand].nav-btn",
          m("i.icon.icon-large.ion-close")
        )
      ),
      m("ul.no-bullet.off-canvas-nav",
        [
          m("li",m("a.clickable",{onclick: closeNav },"Trending")),
          m("li",m("a.clickable[href='/top']",{config:m.route},"Top")),
          m("li",searchInput())
        ]
      )
    ),
    m("label[for=nav-expand].overlay")
  ]
  
# not reusable component used to search
searchInput = () ->
  search = (e) ->
    e.preventDefault()
    document.getElementById("nav-expand").checked = ""
    m.route("/search/#{model.searchTerm()}")
    return
  return m("form",{onsubmit:search},
    m("div.inner-addon.left-addon",
      [
        m("i.icon.ion-search"),
        m("input.search-input[type=text][name=search][pattern='.{4,}'][required][title='4 characters minimum']",{value: model.searchTerm(), oninput: m.withAttr("value", model.searchTerm)})
      ]
    )
  )

#contains all of the data
model = {
  searchTerm: m.prop("")
  getData: ()->
    return m.request({method:'Get',url:'/hot',type:TrendingGame,background: true})
  getTopGames: ->
    return m.request({method:'Get',url:'/json/top100.json',background: true})
  getSearchResults: (keyword) ->
    return m.request({method:'Get',url:"/search?type=boardgame&query=#{keyword}",type:SearchResult,background: true})
  getInitialBoardGameData: (id) ->
    return m.request({method:'Get',url:"/thing?id=#{id}&stats=1",type:BoardGame,background: true})
  getGameData: (id,query) ->
    query ?= {}
    url = "/thing?id=#{id}"
    for k,v of query
      url += "&#{k}=#{v}"
    return m.request({method:'Get',url:url,background:true})
  getReviews: (id) ->
    return m.request({method:'Get',url:"/reviews/#{id}",background: true})
  getThread: (id) ->
    return m.request({method:'Get',url:"/thread/#{id}",background: true})
  }
    
#---------------------------------------------------------------------  
# PAGES
#---------------------------------------------------------------------


topPage = {}

topPage.controller = ->
  @type = m.route.param("type")
  @type ?= "boardgame"
  @games = m.prop([])
  model.getTopGames().then((data) => @games((new TopGame({id:x}) for x in data[@type]))).then(m.redraw)
  @resultsTable = new SearchTable.controller(@games)
  return

topPage.view = (ctrl) ->
  resultsTable = [new SearchTable.view(ctrl.resultsTable)]
  return util.topLayout(ctrl.type,m('div.animation-bounce-in-right',resultsTable))


threadPage = {}

threadPage.controller = ->
  @gameId = m.route.param("id")
  @threadId = m.route.param("threadid")
  @gameData = m.prop()
  @thread = m.prop()
  model.getInitialBoardGameData(@gameId).then(@gameData).then(m.redraw)
  model.getThread(@threadId).then(@thread).then(m.redraw)
  return

threadPage.view = (ctrl) ->
  console.log ctrl.thread()
  threadView = GameThread(ctrl.thread())
  page = m("div",threadView)
  return util.gameLayout(ctrl.gameData,page)
  
gameReviewsPage = {}

gameReviewsPage.controller = ->
  @gameId = m.route.param("id")
  #we don't access anything else from game data here
  @gameData = m.prop()
  @threads = m.prop()
  model.getInitialBoardGameData(@gameId).then(@gameData).then(m.redraw)
  model.getReviews(@gameId).then(@threads).then(m.redraw)
  return

gameReviewsPage.view = (ctrl) ->
  console.log ctrl.threads()
  forumView = GameForum(ctrl.threads(),ctrl.gameData()?.id)
  page = m("div",forumView)
  return util.gameLayout(ctrl.gameData,page)
  
gameStatsPage = {}

gameStatsPage.controller = ->
  @gameId = m.route.param("id")
  @gameData = m.prop()
  model.getInitialBoardGameData(@gameId).then(@gameData).then(m.redraw)
  .then( => 
    model.getGameData(@gameId,{comments:1,pagesize:100})
    .then((x) => 
      @gameData().putComments(x.comments))
    .then(m.redraw)
    return
  )
  return

gameStatsPage.view = (ctrl) ->
  console.log ctrl.gameData()
  statsViev = GameStats(ctrl.gameData())
  commentView = GameComment(ctrl.gameData())
  page = m("div",[statsViev,commentView])
  return util.gameLayout(ctrl.gameData,page)

gameDetailsPage = {}

gameDetailsPage.controller = ->
  #m.redraw.strategy("diff")
  @gameId = m.route.param("id")
  @gameData = m.prop()
  model.getInitialBoardGameData(@gameId).then(@gameData).then(m.redraw)
  return
  
gameDetailsPage.view = (ctrl) ->
  console.log ctrl.gameData()
  detailsView = GameDetails(ctrl.gameData())
  page = m("div",detailsView)
  return util.gameLayout(ctrl.gameData,page)
  
gameOverviewPage = {}

gameOverviewPage.controller = ->
  #m.redraw.strategy("diff")
  @gameId = m.route.param("id")
  @gameData = m.prop()
  model.getInitialBoardGameData(@gameId).then(@gameData).then(m.redraw)
  return
  
gameOverviewPage.view = (ctrl) ->
  console.log ctrl.gameData()
  nameView = GameSummary(ctrl.gameData())
  descriptionView = GameDescription(ctrl.gameData())
  page = m("div",[nameView, descriptionView])
  return util.gameLayout(ctrl.gameData,page)
  #return util.layout(ctrl.gameData()?.name, page)
  
GameThread = (thread) ->
  loaded = thread?.id?
  if loaded
    text = thread.articles.article[0]?.body or thread.articles.article?.body
    content = m("div.section.animation-bounce-up",m.trust(text))
  else
    content = m("div")
  body = m("div.container",[m("div.subheader",thread?.subject),ThreadSkeleton(),content])
  return body
  
GameForum = (forum,gameId) ->
  randomThread = ->
    thread = forum[Math.floor(Math.random() * forum.length)]
    onClick(thread)
    return
  onClick = (data) ->
    m.route("/bg/#{gameId}/reviews/#{data.id}")
    return
  loaded = forum?.length > 0
  if loaded
    content = BetterList(forum,[{el:(data) ->
      return [m("div",data.subject),
      m("div.secondary","date: #{data.lastpostdate.slice(4,16)}"),
      m("div.secondary","posts: #{data.numarticles}")]
      }],".forum.no-bullet.animation-bounce-up",onClick)
  else
    content = m("div")
  body = m("div.container",[m("div.subheader",
    [m("span","Reviews"),
    new Icon(".ion-shuffle.clickable",{onclick:randomThread})
    ]),content])
  return body
  
GameComment = (game) ->
  loaded = game?.comments?
  if loaded
    comment = game.featuredComment
    content = m("div.animation-bounce-up",
      m("div.comment",[comment.value,
        m("cite","Rating: #{comment.rating}"),
        m("cite",comment.username)]
      )
    )
  else
    content = m("div")
  body = m("div.container.section",[m("div.subheader",
    [m("span","Featured Rating"),
    new Icon(".ion-refresh.clickable",{onclick:->
      game.randomizeComment()
      m.redraw()
      return})
    ]),content])
  
GameStats = (game) ->
  loaded = game?.id?
  if loaded
    ranks = game.getRanks()
    stats = [
      ["Average Rating", game.getStat("bayesaverage").toFixed(1)],
      ["Number Of Ratings", game.getStat("usersrated")]
      ]
    stats = ranks.concat(stats)
    content = PlainList(stats.map((item) ->
      return [m("div.label",item[0]),m("div.value",item[1])]
      ),".no-bullet.stats.animation-bounce-up")
  else
    content = m("div")
  body = m("div.container.section",[m("div.subheader","Statistics"),content])
  return body
  
GameDetails = (game) ->
  loaded = game?.id?
  if loaded
    details = [
      ["Designer",game.designer]
      ["Artist",game.artist]
      ["Publisher",game.publisher]
      ["Category",game.category]
      ["Mechanic",game.mechanic]
    ]
    content = PlainList(details.map((item) ->
      #return [m("div.label",item[0])]
      return [m("div.label",item[0]),
      PlainList(item[1],".no-bullet.value")]
      ),".no-bullet.details.animation-bounce-up")
  else
    content = m("div")
  body = m("div.container.section",[m("div.subheader","Details"),content])
  return body
  
GameSummary = (data) ->
  loaded = data?.id?
  if loaded
    if data?.thumbnail?
     img = new Image({
        src:data.thumbnail
      })
    else
      img = ""
    stats = []
    stats.push([".ion-speedometer",parseFloat(data?.getStat("bayesaverage").toFixed(1))])
    stats.push([".ion-calendar",data?.year])
    stats.push([".ion-person-stalker",data?.numplayers])
    stats.push([".ion-person",data?.minage + "+"])
    stats.push([".ion-clock",data?.playingtime + " mins"])
    quickStats = PlainList(stats.map((item,index) ->
      return QuickStat(item[0],item[1])),
      ".no-bullet")
    content = m("div.game-summary.section.animation-bounce-up",[m("div.game-img",img),quickStats])
  else
    content = m("div")
    
  body = m("div.container",[GameSummarySkeleton(),content])
  return body
  
GameDescription = (game) ->
  loaded = game?.id
  if loaded
    content = m("div.section.animation-bounce-up",m.trust(game?.description))
  else
    content = m("div")
  body = m("div.container",[GameDescriptionSkeleton(),content])
  return body
  
QuickStat = (iconClass, value) ->
  return m("div.quick-stat",[new Icon(iconClass),value])

#---------------------------------------------------------------------

searchPage = {}

searchPage.controller = ->
  #m.redraw.strategy("diff")
  @term = m.route.param("keyword")
  @results = m.prop([])
  @resultsTable = new SearchTable.controller(@results)
  model.getSearchResults(@term)
  .then(
    (data) =>
      # data is always instanceof SearchResult
      # all games need to have an id
      if data instanceof Array
        @results(data)
      else if not data.id?
        @results(null)
      else
        @results([data])
    )
  .then(m.redraw)
  return
    
searchPage.view = (ctrl) ->
  resultsTable = [new SearchTable.view(ctrl.resultsTable)]
  return util.layout("Search",m('div.animation-bounce-in-right',[m('div.full-search',searchInput()),resultsTable]))

#---------------------------------------------------------------------

trendingPage = {}

trendingPage.controller = ->
  m.redraw.strategy("diff")
  @games = m.prop([])
  @loading = m.prop(true)
  @trendingTable = new TrendingTable.controller(@games)
  model.getData().then(@games).then(m.redraw)
  return

trendingPage.view = (ctrl) ->
  ttable = [new TrendingTable.view(ctrl.trendingTable)]
  return util.layout("Trending",ttable)
  
#---------------------------------------------------------------------  
# Models
#---------------------------------------------------------------------

#TODO:
# unify the models
# tiered cache in localStorage and memory rather than relying on http

BoardGame = (data) ->
  console.log data
  
  # Returns the html of description string
  getHTMLString = (string) =>
    return string if not string?
    # [String]
    htmlString = string

    regex = new RegExp("&#10;&#10;    ", "g")
    htmlString = htmlString.replace(regex, "</br></br><ul><li>")


    regex = new RegExp("&#10;&#10;&#10;", "g")
    htmlString = htmlString.replace(regex, "</li></ul></br>")

    regex = new RegExp("&#10;    ", "g")
    htmlString = htmlString.replace(regex, "</li><li>")

    regex = new RegExp("&#10;&#10;", "g")
    htmlString = htmlString.replace(regex, "</br></br>")

    regex = new RegExp(@name, "g")
    htmlString = htmlString.replace(regex, "<b>" + @name + "</b>")
    return htmlString
    
  getLinks = (links, type) ->
    results = (link.value for link in links when link.type is type)
    
  populate = (data) =>
    populateLinks = =>
      for link in data?.link
        switch link.type
          when "boardgamedesigner" then @designer.push(link.value)
          when "boardgameartist" then @artist.push(link.value)
          when "boardgamepublisher" then @publisher.push(link.value)
          when "boardgamecategory" then @category.push(link.value)
          when "boardgamemechanic" then @mechanic.push(link.value)
    if data?
      @id = data?.id
      @name = if data?.name instanceof Array then data?.name[0].value else data?.name?.value
      @thumbnail = data?.thumbnail?.value or data?.thumbnail
      @year = data?.yearpublished?.value
      @description = getHTMLString(data?.description)
      @statistics = data?.statistics
      @numplayers = if data?.minplayers.value is data?.maxplayers.value then data?.minplayers.value else "#{data?.minplayers.value} - #{data?.maxplayers.value}"
      @minage = data?.minage?.value
      @playingtime = data?.playingtime.value
      @designer = []
      @artist = []
      @publisher = []
      @category = []
      @mechanic = []
      populateLinks()
      return
  @getRanks = ->
    return ([rank.friendlyname,rank.value] for rank in @statistics?.ratings?.ranks?.rank)
  @getStat = (name) ->
    @statistics?.ratings?[name]?.value
  @putComments = (comments)->
    @comments = comments.comment
    @goodComments = (comment for comment in @comments when comment.value.length > 119 and parseInt(comment.rating) > 0)
    @randomizeComment()
    return
  @randomizeComment= ->
    @featuredComment = @goodComments[Math.floor(Math.random() * @goodComments.length)]
  populate(data)
  return

SearchResult = (data) ->
  populate = (data) =>
    if data?
      @id = data?.id
      @name = if data?.name instanceof Array then data?.name[0].value else data?.name?.value
      @thumbnail = data?.thumbnail?.value or data?.thumbnail
      @year = data?.yearpublished?.value
      @statistics = data?.statistics
      return
  @getStat = (name) ->
    @statistics?.ratings?[name]?.value
  populate(data)
  model.getGameData(@id,{"stats":1}).then(populate).then(m.redraw)
  return

TopGame = (data) ->
  populate = (data) =>
    if data?
      @id = data?.id
      @name = if data?.name instanceof Array then data?.name[0].value else data?.name?.value
      console.log data?.name
      console.log @name
      @thumbnail = data?.thumbnail?.value or data?.thumbnail
      @year = data?.yearpublished?.value
      @statistics = data?.statistics
      return
  @getStat = (name) ->
    @statistics?.ratings?[name]?.value
  populate(data)
  model.getGameData(@id,{"stats":1}).then(populate).then(m.redraw)
  return
  
TrendingGame = (data) ->
  @id = data?.id
  @name = data.name.value
  @thumbnail = data.thumbnail.value
  @rank = data.rank
  @year = data?.yearpublished?.value
  return
  
#---------------------------------------------------------------------  
# Components
#---------------------------------------------------------------------

SearchTable = {}

#
# @param data [Array, null] contains SearchResult objects
#
SearchTable.controller = (data) ->
  elements = [
    (game) -> 
      if game.thumbnail?
        new Image({
          src:game.thumbnail
          class: 'img-center'
        })
      else
        ""
    (game) ->
      [
        m("span.game-title--small",game.name + " "),
        m("small",{style:{display:"block"}},game.year)
      ]
    (game) -> 
      num = parseFloat(game.getStat("bayesaverage")).toFixed(1)
      return if not isNaN(num) then num else ""
  ]
  rowOnClick = (e,item) ->
    m.route("/bg/#{item.id}")
    return
    
  @table = new Mobile3ColList.controller(elements, data, rowOnClick)
  return

SearchTable.view = (ctrl) ->
    return new Mobile3ColList.view(ctrl.table)

#---------------------------------------------------------------------

TrendingTable = {}

#
# @param data [Array, null] contains TrendingGame objects
#
TrendingTable.controller = (data) ->
  elements = [
    (data) -> 
      if data.thumbnail?
        new Image({
          src:data.thumbnail
          class: 'img-center'
        })
      else
        ""
    (data) ->
      [
        m("span.game-title--small",data.name + " "),
        m("small",{style:{display:"block"}},data.year)
      ]
    (data) -> data.rank
  ]
  rowOnClick = (e,item) ->
    m.route("/bg/#{item.id}")
    return
    
  @table = new Mobile3ColList.controller(elements, data, rowOnClick)
  return

TrendingTable.view = (ctrl) ->
    return new Mobile3ColList.view(ctrl.table)
    
#---------------------------------------------------------------------

Mobile3ColList = {}

Mobile3ColList.controller = (elements, data, rowOnClick) ->
  row = [
    {
      classes: ".img-col"
      el: elements[0]
    },
    {
      classes: ".main-col"
      el: elements[1]
    },
    {
      classes: ".num-col"
      el: elements[2]
    }
  ]
  @table = new List.controller(row, data, rowOnClick)
  return

Mobile3ColList.view = (ctrl) ->
  return new List.view(ctrl.table)

#---------------------------------------------------------------------

List = {}

List.controller = (row, data, @rowOnClick) ->
  @state = {}
  @row = m.prop(row)
  @data = data
  return

List.view = (ctrl) ->
  # consider it loaded if null or array.length > 0
  loaded = not ctrl.data()? or ctrl?.data()?.length>0
  if not ctrl.data()?
    list = m("ul.trending-list.animation-bounce-up",m("li.text-center","No results found"))
  else if loaded
    list = m("ul.trending-list.animation-bounce-up", ctrl.data().map((item,index) ->
      return m("li",{onclick:(e) -> ctrl.rowOnClick(e,item)} if ctrl.rowOnClick?, ctrl.row().map(
        (cell) ->
          element = "div" + if cell.classes? then cell.classes else ""
          return m(element, cell.attrs, cell.el(item))
        )
      )
    ))
  else
      list = m("ul")
  body = m("div",[TempList(),list])
  return body
  
#---------------------------------------------------------------------

BetterList = (data,row,classes,onClick) ->
  classes ?= ""
  return m("ul" + classes, data.map (item,index) ->
    return m("li",{onclick: -> onClick(item)} if onClick?,row.map (cell) ->
      element = "div" + if cell.classes? then cell.classes else ""
      return m(element, cell.attrs, cell.el(item))
      )
    )
  
PlainList = (items,classes) ->
  classes ?= ""
  return m("ul" + classes, items.map (item,index) ->
    return m("li",item)
  )
  
#---------------------------------------------------------------------

GameSummarySkeleton = ->
  stats = [".ion-speedometer",".ion-calendar",".ion-person-stalker",
  ".ion-person",".ion-clock"]
  stats = PlainList(stats.map((item,index) ->
    return QuickStat(item,"")),
    ".no-bullet")
  return m("div.game-summary.under",[m("div.game-img",m("span.placeholder-img.placeholder-yellow")),stats])
 
ThreadSkeleton = ->
  sample = [m("p.text-center","Review of a game"),
  m("p","Crossroads is a new series from Plaid Hat Games that tests a group of survivors' ability to work together and stay alive while facing crises and challenges from both outside and inside."),
  m("p","Dead of Winter: A Crossroads Game, the first game in this series, puts 2-5 players"),
  m("p","""Dead of Winter: A Crossroads Game, the first game in this series, puts 2-5 players
  ########### ##### ############ ##### ########### ############## ##### ######## #############
  ###### ########## ############## ######## ###### ### ## ######## ###### ##### ##### #### #####
  ##### ######## ############ ######
  """)]
  return m("div.placeholder-description.under.section",sample)
   
GameDescriptionSkeleton = ->
  sample = [m("p","Game description from the publisher:"),
  m("p","Crossroads is a new series from Plaid Hat Games that tests a group of survivors' ability to work together and stay alive while facing crises and challenges from both outside and inside."),
  m("p","Dead of Winter: A Crossroads Game, the first game in this series, puts 2-5 players")]
  return m("div.placeholder-description.under.section",sample)
  
#---------------------------------------------------------------------

TempList = ->
  return m("ul.temp-list.under",[0..10].map ->
    return m("li",[
      m("div.img-col",m("span.placeholder-yellow")),
      m("div.main-col",m("span.placeholder-blue")),
      ]
    )
  )

#---------------------------------------------------------------------

Image = (options) ->
  options ?= {}
  return m("img",options)
  
#---------------------------------------------------------------------

Icon = (classes,options) ->
  classes ?= ""
  options ?= {}
  return m("i.icon." + classes,options)

#---------------------------------------------------------------------  
# Components
#---------------------------------------------------------------------

#use default mode
m.route.mode = "search"

m.route document.body, "/", {
    "/": trendingPage
    "/top/:type": topPage
    "/top": topPage
    "/search/:keyword": searchPage
    "/bg/:id/details": gameDetailsPage
    "/bg/:id/stats": gameStatsPage
    "/bg/:id/reviews/:threadid": threadPage
    "/bg/:id/reviews": gameReviewsPage
    "/bg/:id": gameOverviewPage
}
