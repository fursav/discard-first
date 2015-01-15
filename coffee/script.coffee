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

searchPage = {}

searchPage.controller = ->
  m.redraw.strategy("diff")
  @term = m.route.param("keyword")
  @results = m.prop([])
  @resultsTable = new SearchTable.controller(@results)
  #model.getSearchResults(@term).then(@results).then(m.redraw)
  model.getSearchResults(@term).then((data) =>
    # data is always instanceof SearchResult
    # all games need to have an id
    if data instanceof Array
      @results(data)
    else if not data.id?
      console.log "nulling"
      @results(null)
    else
      @results([data])
    )
    .then(m.redraw)
  return
    
searchPage.view = (ctrl) ->
    resultsTable = [new SearchTable.view(ctrl.resultsTable)]
    return util.layout("Search",m('div.animation-bounce-in-right',[m('div.full-search',searchInput()),resultsTable]))

trendingPage = {}

trendingPage.controller = ->
    m.redraw.strategy("diff")
    @games = m.prop([])
    @loading = m.prop(true)
    @trendingTable = new TrendingTable.controller(@games)
    model.getData().then(@games).then(m.redraw)
    # model.getData().then(@games).then(=>
        # console.log "loaded"
        # @loading(false)
        # return
        # )
        # ).then(m.redraw)
        # )
    return

trendingPage.view = (ctrl) ->
    #return m("div.main",[new TrendingTable.view(ctrl.trendingTable)])
    #if ctrl.loading
    #body = [m("div.text-center",{style:{width:"100%"}},[m("i",{class:"icon ion-loading-c icon-large"})])]
    #else
        #body = [new TrendingTable.view(ctrl.trendingTable)]
    # body = if ctrl.loading() then [m("div.text-center","Trending Games")] else [new TrendingTable.view(ctrl.trendingTable)]
    # body = if (ctrl.trendingTable? and not window.animating) then [m("div",[new TrendingTable.view(ctrl.trendingTable)])] else [m("div.full-screen",{config:slidesIn},[m("div.center","Trending Games")])]
    # ttable = if ctrl.trendingTable? then m("div",{config:fadesIn},[new TrendingTable.view(ctrl.trendingTable)]) else m("div")
    ttable = [new TrendingTable.view(ctrl.trendingTable)]
    # body = [m("div.full-screen",{config:slidesIn},[m("div.center","Trending Games")]),ttable]
    # console.log window.animating
    #return m("div.main",ttable)
    return util.layout("Trending",ttable)

slidesIn = (element, isInitialized, context) =>
    if not isInitialized
        # element.style.width = "0"
        element.style.left = "100%"
        # $.Velocity(element,{ left:0,easing:"spring"});
        window.animating = true
        $.Velocity(element,{ translateX: "-100%"})
        $.Velocity(element,{ translateY: "-100%"},{complete: (e) =>
            window.animating = false
            m.redraw()
            return
        })

slidesUp = (element, isInitialized, context) =>
    if not isInitialized
        # element.style.width = "0"
        element.style.top = "10%"
        # $.Velocity(element,{ left:0,easing:"spring"});
        window.animating = true
        $.Velocity(element,{ translateX: "-10%"})
        # $.Velocity(element,{ translateY: "-100%"},{complete: (e) =>
        #     window.animating = false
        #     m.redraw()
        #     return
        # })
  #       Velocity(element,"slideDown", { duration: 1000 ,
  # ease: 'ease-in-cubic',})
        # Velocity(element, {opacity: 1})

# fadesIn = (element, isInitialized, context) ->
#     if not isInitialized
#         element.style.opacity = 0.1
#         console.log "fadein"
#         # $.Velocity(element,"transition.fadeIn")
#         $.Velocity(element,{ opacity:1});


fadesOut = (element, isInitialized, context) ->
    if element.style.opacity is "" or element.style.opacity is not 0
        # m.redraw.strategy("none")
    # console.log isInitialized
    # if not isInitialized
        # element.style.opacity = 0
        console.log "out"
        $.Velocity(element,"transition.fadeOut")
        # $.Velocity(element,{ opacity:0,easing:"easeInQuint"}
        # $.Velocity(element,{ opacity:0,easing:"easeInQuint",duration:"slow"},{complete: ->
        #     m.redraw()
        #     return});

#BoardGame = (data) ->
    #populate = (data) =>
        #console.log data
        #if data?
            #@id = data?.id
            #@name = if data?.name instanceof Array then data?.name[0].value else data?.name?.value
            #@thumbnail = data?.thumbnail?.value or data?.thumbnail
            #@year = data?.yearpublished?.value
            #@rank = ""
            #return
    #populate(data)
    #model.getGameData(@id).then(populate).then(m.redraw)
    
SearchResult = (data) ->
    populate = (data) =>
        #console.log data
        if data?
            @id = data?.id
            @name = if data?.name instanceof Array then data?.name[0].value else data?.name?.value
            @thumbnail = data?.thumbnail?.value or data?.thumbnail
            @year = data?.yearpublished?.value
            @statistics = data?.statistics
            #@rank = rank.
            return
    @getStat = (name) ->
        @statistics?.ratings?[name]?.value
    populate(data)
    model.getGameData(@id,{"stats":1}).then(populate).then(m.redraw)
        
    return

TrendingGame = (data) ->
    @name = data.name.value
    @thumbnail = data.thumbnail.value
    @rank = data.rank
    @year = data?.yearpublished?.value
    return

SearchTable = {}

SearchTable.controller = (data) ->
    elements = [
        (game) -> 
            new Image({
                src:game.thumbnail
                class: 'img-center'
            })
        (game) ->
            [
                m("span.game-title--small",game.name + " "),
                m("small",{style:{display:"block"}},game.year)
            ]
        (game) -> parseFloat(game.getStat("bayesaverage")).toFixed(1)
        ]

    @table = new Mobile3ColList.controller(elements, data)
    return

SearchTable.view = (ctrl) ->
    return new Mobile3ColList.view(ctrl.table)

TrendingTable = {}
TrendingTable.controller = (data) ->
    elements = [
        (data) -> 
            new Image({
                src:data.thumbnail
                class: 'img-center'
            })
        (data) ->
            [
                m("span.game-title--small",data.name + " "),
                m("small",{style:{display:"block"}},data.year)
            ]
        (data) -> data.rank
        ]

    @table = new Mobile3ColList.controller(elements, data)
    return

TrendingTable.view = (ctrl) ->
    return new Mobile3ColList.view(ctrl.table)

Mobile3ColList = {}

Mobile3ColList.controller = (elements, data) ->
    row = [
        {
            attrs: {
                style: {
                    textAlign:'center'
                    position:'relative'
                    width:'30%'
                    height:'50px'
                    overflow:'hidden'
                    maxWidth:'100px'
                }
            },
            el: elements[0]
            
        },
        {
            attrs:{
                style: {
                    width:"58%"
                    overflow:'hidden'
                    padding:'0 5px'
                    # height:"50px"
                }
            },
            el: elements[1]
        },
        {
            attrs: {
                style: {
                    textAlign:'right'
                    width:"12%"
                    padding:"0 10px"
                }
            },
            el: elements[2]
        }
    ]
    @table = new List.controller(row, data)
    return

Mobile3ColList.view = (ctrl) ->
    return new List.view(ctrl.table)
    
List = {}

List.controller = (row,data) ->
    @state = {}
    @data = data
    #console.log data()
    #if data?
        #if data() instanceof Array
            #@data = data
        #else
            #@data = m.prop([data])
    #@data = if data?
        # if @state.sortType
        #     sortMult = {asc:1,des:-1}[@state.sortDir]
        #     data.sort (a,b) =>
        #         aVal = a[@state.sortKey]
        #         bVal = b[@state.sortKey]
        #         result = 0
        #         result = 1 if aVal > bVal
        #         result = -1 if aVal < bVal
        #         return result * sortMult
        # return data
    @row = m.prop(row)
    return

List.view = (ctrl) ->
  # consider it loaded if null or array.length > 0
    loaded = not ctrl.data()? or ctrl?.data()?.length>0
    if not ctrl.data()?
      list = m("ul.trending-list.above.animation-bounce-up",m("li.text-center","No results found"))
    else if loaded
        list = m("ul.trending-list.above.animation-bounce-up",ctrl.data().map((item,index) ->
            return m("li", ctrl.row().map((cell) ->
                if typeof(cell) is "function"
                    console.log "fn"
                    return m("div", cell(item))
                return m("div",cell.attrs, cell.el(item))
                )
            )
        ))
    else
        list = m("ul")
    body = m("div",[TempList(loaded),list])
    return body

TempList = (loaded)->
    anim = (a,b,c) =>
        console.log "here"
        if loaded then fadesOut(a,b,c)
        return
    styl = if loaded then {
        style:
            #opacity: 0
            position: "absolute"
            width: "100%"
            zIndex: "-2"
         #class: 
             #"animation-fly-out"
             #"animation-fade-out"
         #left: "1000%"
        # position: "absolute"
         #visibility: "hidden"
        #display: "none"
    }
    return m("ul.temp-list.under",[0..10].map ->
        return m("li",[m("div",{style:{
                    width:'30%'
                    height:'50px'
                    maxWidth:'100px'
                    }},[m("span.placeholder-yellow")]),m("div",{style:{
                    width:'70%'
                    height:'50px'
                        }},[m("span.placeholder-blue")])])
    )

Table = {}
Table.controller = (header,row,data,state) ->
    @state = state ? {}
    #@data = m.prop(data)
    @data = =>
        if @state.sortType
            sortMult = {asc:1,des:-1}[@state.sortDir]
            data.sort (a,b) =>
                aVal = a[@state.sortKey]
                bVal = b[@state.sortKey]
                result = 0
                result = 1 if aVal > bVal
                result = -1 if aVal < bVal
                return result * sortMult
        return data

    @header = m.prop(header)
    @row = m.prop(row)
    @handleHeaderClick = (e) =>
        sortType = e.target.getAttribute('data-sort-type')
        sortKey = e.target.getAttribute('data-sort-key')
        if sortType?
            if sortType is @state.sortType
                @state.sortDir = if @state.sortDir is "asc" then "des" else "asc"
            else @state.sortDir = "asc"
            @state.sortType = sortType
            @state.sortKey = sortKey
        return
    return
Table.view = (ctrl) ->
    headerAttrs = (item)->
        attrs = {}
        attrs['data-sort-type'] = item.type if item.type?
        attrs['data-sort-key'] = item.key if item.key?
        attrs.class = if ctrl.state.sortKey is item.key then ctrl.state.sortDir ? "" else ""
        return attrs
    head = m("thead", {
            onclick: ctrl.handleHeaderClick
        }
        [m("tr", ctrl.header().map((item, index) ->
            return m("th",
                    headerAttrs(item),
                    item.label)
        ))])
    body = m("tbody",ctrl.data().map((item,index) ->
        return m("tr", ctrl.row().map((cell) ->
            if typeof(cell) is "function"
                return m("td", cell(item))
            return m("td",cell.attrs, cell.el(item))
            )
        )
    ))
    return m("table",[head,body])

Image = (options) ->
    options ?= {}
    return m("img",options)


#use default mode
m.route.mode = "search"

m.route document.body, "/", {
    "/": trendingPage
    "/search/:keyword": searchPage
}
