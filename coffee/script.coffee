styler = {}
styler.styleTable = (root) ->
    if root.tag is "table"
        root.attrs.class = "bordered"
    return root
    
styler.styleTableHeader = (root,parent) ->
    if (not root) 
        return root
    else if (root instanceof Array)
        for item in root
            this.styleTableHeader(item, parent)
    else if (root.children instanceof Array)
        this.styleTableHeader(root.children, root)
    else if (root.tag is "th" and root.attrs['data-sort-type'])
        root.attrs.class ?= ""
        root.attrs.class += " clickable"

    return root;
    
orLoading = (elements,loading)->
    console.log "here"
    console.log loading
    if loading
        return [m("i",{class:"icon ion-loading-c icon-large"})]
    return elements

model = {
    getData: ()->
        return m.request({method:'Get',url:'/hot',type:TrendingGame,background: true})
    }

trendingPage = {}

trendingPage.controller = ->
    @games = m.prop([])
    @loading = m.prop(true)
    model.getData().then(@games).then(=>
        console.log "loaded"
        @loading(false)
        @trendingTable = new TrendingTable.controller(@games())
        return
        ).then(m.redraw)
    return
    
trendingPage.view = (ctrl) ->
    #return m("div.main",[new TrendingTable.view(ctrl.trendingTable)])
    #if ctrl.loading 
    #body = [m("div.text-center",{style:{width:"100%"}},[m("i",{class:"icon ion-loading-c icon-large"})])]     
    #else
        #body = [new TrendingTable.view(ctrl.trendingTable)]
    body = if ctrl.loading() then [m("div.text-center",[m("i",{class:"icon ion-loading-c icon-large"})])] else [new TrendingTable.view(ctrl.trendingTable)]
    return m("div.main",body)
    
TrendingGame = (data) ->
    @name = data.name.value
    @thumbnail = data.thumbnail.value
    @rank = data.rank
    @year = data?.yearpublished?.value
    return
    
TrendingTable = {}    
TrendingTable.controller = (data) ->
    header = [
        {
            label: ""
        },
        {
            label: "Name",
            key: "name",
            type: "string"
        },
        {
            label: "Rank",
            key: "rank",
            type: "int"
        }
    ]
    row = [
        {
            attrs: {
                style: {
                    textAlign:'center'
                }
            },
            el: (data) -> [
                new Image({
                    src:data.thumbnail
                    class:'radius thumbnail'
                })
            ]
        },
        (data) -> [m("span.game-title--small",[data.name," ",m("small",data.year)])],
        {
            attrs: {
                style: {
                    textAlign:'right'
                }
            },
            el: (data) -> data.rank
        }
    ]
    @table = new Table.controller(header,row,data)
    return
    
TrendingTable.view = (ctrl) ->
    return styler.styleTableHeader(styler.styleTable(new Table.view(ctrl.table)))
    
    
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

m.route(document.body, "/", {
    "/": trendingPage
})
