# defines the layout of the page
util = {}    
    
util.layout = (title, body) =>
  return m("#wrap", [
      util.header(title),
      util.nav(),
      m("main", body)
  ]);

util.header = (title) ->
  return m("header.banner",
    [
      m("div.banner-left",
        m("label.nav-btn",{for:"nav-expand"},
          m("i.icon.icon-large.ion-navicon")
        )
      ),
      m("div.banner-title",title)
    ])

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
      m("ul.off-canvas-nav",
        [
          m("li",m("a.clickable",{onclick: closeNav },"Trending")),
          m("li",m("div","Item 2")),
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
  }
    
#---------------------------------------------------------------------  
# PAGES
#---------------------------------------------------------------------

gameOverviewPage = {}

gameOverviewPage.controller = ->
  m.redraw.strategy("diff")
  @gameId = m.route.param("id")
  @gameData = m.prop()
  #@gameData = model.getInitialBoardGameData(@gameId)
  model.getInitialBoardGameData(@gameId).then(@gameData).then(m.redraw)
  return
  
gameOverviewPage.view = (ctrl) ->
  console.log ctrl.gameData()
  nameView = GameSummary(ctrl.gameData())
  return util.layout(ctrl.gameData()?.name, nameView)
#
# @param data [BoardGame]
#
NameView = (data) ->
  console.log data
  if data?.thumbnail?
   img = new Image({
      src:data.thumbnail
      class: 'img-center2'
    })
  else
    img = ""
  #title = m("h2",data?.name)
  quickStats = ""
  return m("div",[
    img,qui]
  )
  
GameSummary = (data) ->
  console.log data
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
  return m("div.game-summary",[m("div.game-img",img),quickStats])
  
QuickStat = (iconClass, value) ->
  return m("div.quick-stat",[new Icon(iconClass),value])
  

#---------------------------------------------------------------------

searchPage = {}

searchPage.controller = ->
  m.redraw.strategy("diff")
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
  populate = (data) =>
    if data?
      @id = data?.id
      @name = if data?.name instanceof Array then data?.name[0].value else data?.name?.value
      @thumbnail = data?.thumbnail?.value or data?.thumbnail
      @year = data?.yearpublished?.value
      @statistics = data?.statistics
      @numplayers = if data?.minplayers.value is data?.maxplayers.value then data?.minplayers.value else "#{data?.minplayers.value} - #{data?.maxplayers.value}"
      @minage = data?.minage?.value
      @playingtime = data?.playingtime.value
      return
  @getStat = (name) ->
    @statistics?.ratings?[name]?.value
  populate(data)
  #model.getGameData(@id,{"stats":1}).then(populate).then(m.redraw)
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

PlainList = (items,classes) ->
  classes ?= ""
  return m("ul" + classes,items.map (item,index) ->
    return m("li",item)
  )
  
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

Icon = (classes) ->
  classes ?= ""
  return m("i.icon." + classes)

#---------------------------------------------------------------------  
# Components
#---------------------------------------------------------------------

#use default mode
m.route.mode = "search"

m.route document.body, "/", {
    "/": trendingPage
    "/search/:keyword": searchPage
    "/bg/:id": gameOverviewPage
}
