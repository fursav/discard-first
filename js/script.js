(function() {
  var Image, List, Mobile3ColList, SearchResult, SearchTable, Table, TempList, TrendingGame, TrendingTable, fadesOut, model, searchInput, searchPage, slidesIn, slidesUp, trendingPage, util;

  util = {};

  util.layout = (function(_this) {
    return function(title, body) {
      return m("#wrap", [util.header(title), util.nav(), m("main", body)]);
    };
  })(this);

  util.header = function(title) {
    return m("header.banner", [
      m("div.banner-left", m("label.nav-btn", {
        "for": "nav-expand"
      }, m("i.icon.icon-large.ion-navicon"))), m("div.banner-title", title)
    ]);
  };

  util.nav = function() {
    var closeNav;
    closeNav = function() {
      document.getElementById("nav-expand").checked = false;
      m.route("/");
    };
    return [
      m("input#nav-expand[name=nav][type=checkbox][checked=''].invisible"), m("nav.off-canvas", m("div.off-canvas-title", m("label[for=nav-expand].nav-btn", m("i.icon.icon-large.ion-close"))), m("ul.off-canvas-nav", [
        m("li", m("a.clickable", {
          onclick: closeNav
        }, "Trending")), m("li", m("div", "Item 2")), m("li", searchInput())
      ])), m("label[for=nav-expand].overlay")
    ];
  };

  searchInput = function() {
    var search;
    search = function(e) {
      e.preventDefault();
      document.getElementById("nav-expand").checked = "";
      m.route("/search/" + (model.searchTerm()));
    };
    return m("form", {
      onsubmit: search
    }, m("div.inner-addon.left-addon", [
      m("i.icon.ion-search"), m("input.search-input[type=text][name=search][pattern='.{4,}'][required][title='4 characters minimum']", {
        value: model.searchTerm(),
        oninput: m.withAttr("value", model.searchTerm)
      })
    ]));
  };

  model = {
    searchTerm: m.prop(""),
    getData: function() {
      return m.request({
        method: 'Get',
        url: '/hot',
        type: TrendingGame,
        background: true
      });
    },
    getSearchResults: function(keyword) {
      return m.request({
        method: 'Get',
        url: "/search?type=boardgame&query=" + keyword,
        type: SearchResult,
        background: true
      });
    },
    getGameData: function(id, query) {
      var k, url, v;
      if (query == null) {
        query = {};
      }
      url = "/thing?id=" + id;
      for (k in query) {
        v = query[k];
        url += "&" + k + "=" + v;
      }
      return m.request({
        method: 'Get',
        url: url,
        background: true
      });
    }
  };

  searchPage = {};

  searchPage.controller = function() {
    m.redraw.strategy("diff");
    this.term = m.route.param("keyword");
    this.results = m.prop([]);
    this.resultsTable = new SearchTable.controller(this.results);
    model.getSearchResults(this.term).then((function(_this) {
      return function(data) {
        if (data instanceof Array) {
          return _this.results(data);
        } else if (data.id == null) {
          console.log("nulling");
          return _this.results(null);
        } else {
          return _this.results([data]);
        }
      };
    })(this)).then(m.redraw);
  };

  searchPage.view = function(ctrl) {
    var resultsTable;
    resultsTable = [new SearchTable.view(ctrl.resultsTable)];
    return util.layout("Search", m('div.animation-bounce-in-right', [m('div.full-search', searchInput()), resultsTable]));
  };

  trendingPage = {};

  trendingPage.controller = function() {
    m.redraw.strategy("diff");
    this.games = m.prop([]);
    this.loading = m.prop(true);
    this.trendingTable = new TrendingTable.controller(this.games);
    model.getData().then(this.games).then(m.redraw);
  };

  trendingPage.view = function(ctrl) {
    var ttable;
    ttable = [new TrendingTable.view(ctrl.trendingTable)];
    return util.layout("Trending", ttable);
  };

  slidesIn = (function(_this) {
    return function(element, isInitialized, context) {
      if (!isInitialized) {
        element.style.left = "100%";
        window.animating = true;
        $.Velocity(element, {
          translateX: "-100%"
        });
        return $.Velocity(element, {
          translateY: "-100%"
        }, {
          complete: function(e) {
            window.animating = false;
            m.redraw();
          }
        });
      }
    };
  })(this);

  slidesUp = (function(_this) {
    return function(element, isInitialized, context) {
      if (!isInitialized) {
        element.style.top = "10%";
        window.animating = true;
        return $.Velocity(element, {
          translateX: "-10%"
        });
      }
    };
  })(this);

  fadesOut = function(element, isInitialized, context) {
    if (element.style.opacity === "" || element.style.opacity === !0) {
      console.log("out");
      return $.Velocity(element, "transition.fadeOut");
    }
  };

  SearchResult = function(data) {
    var populate;
    populate = (function(_this) {
      return function(data) {
        var _ref, _ref1, _ref2;
        if (data != null) {
          _this.id = data != null ? data.id : void 0;
          _this.name = (data != null ? data.name : void 0) instanceof Array ? data != null ? data.name[0].value : void 0 : data != null ? (_ref = data.name) != null ? _ref.value : void 0 : void 0;
          _this.thumbnail = (data != null ? (_ref1 = data.thumbnail) != null ? _ref1.value : void 0 : void 0) || (data != null ? data.thumbnail : void 0);
          _this.year = data != null ? (_ref2 = data.yearpublished) != null ? _ref2.value : void 0 : void 0;
          _this.statistics = data != null ? data.statistics : void 0;
        }
      };
    })(this);
    this.getStat = function(name) {
      var _ref, _ref1, _ref2;
      return (_ref = this.statistics) != null ? (_ref1 = _ref.ratings) != null ? (_ref2 = _ref1[name]) != null ? _ref2.value : void 0 : void 0 : void 0;
    };
    populate(data);
    model.getGameData(this.id, {
      "stats": 1
    }).then(populate).then(m.redraw);
  };

  TrendingGame = function(data) {
    var _ref;
    this.name = data.name.value;
    this.thumbnail = data.thumbnail.value;
    this.rank = data.rank;
    this.year = data != null ? (_ref = data.yearpublished) != null ? _ref.value : void 0 : void 0;
  };

  SearchTable = {};

  SearchTable.controller = function(data) {
    var elements;
    elements = [
      function(game) {
        return new Image({
          src: game.thumbnail,
          "class": 'img-center'
        });
      }, function(game) {
        return [
          m("span.game-title--small", game.name + " "), m("small", {
            style: {
              display: "block"
            }
          }, game.year)
        ];
      }, function(game) {
        return parseFloat(game.getStat("bayesaverage")).toFixed(1);
      }
    ];
    this.table = new Mobile3ColList.controller(elements, data);
  };

  SearchTable.view = function(ctrl) {
    return new Mobile3ColList.view(ctrl.table);
  };

  TrendingTable = {};

  TrendingTable.controller = function(data) {
    var elements;
    elements = [
      function(data) {
        return new Image({
          src: data.thumbnail,
          "class": 'img-center'
        });
      }, function(data) {
        return [
          m("span.game-title--small", data.name + " "), m("small", {
            style: {
              display: "block"
            }
          }, data.year)
        ];
      }, function(data) {
        return data.rank;
      }
    ];
    this.table = new Mobile3ColList.controller(elements, data);
  };

  TrendingTable.view = function(ctrl) {
    return new Mobile3ColList.view(ctrl.table);
  };

  Mobile3ColList = {};

  Mobile3ColList.controller = function(elements, data) {
    var row;
    row = [
      {
        attrs: {
          style: {
            textAlign: 'center',
            position: 'relative',
            width: '30%',
            height: '50px',
            overflow: 'hidden',
            maxWidth: '100px'
          }
        },
        el: elements[0]
      }, {
        attrs: {
          style: {
            width: "58%",
            overflow: 'hidden',
            padding: '0 5px'
          }
        },
        el: elements[1]
      }, {
        attrs: {
          style: {
            textAlign: 'right',
            width: "12%",
            padding: "0 10px"
          }
        },
        el: elements[2]
      }
    ];
    this.table = new List.controller(row, data);
  };

  Mobile3ColList.view = function(ctrl) {
    return new List.view(ctrl.table);
  };

  List = {};

  List.controller = function(row, data) {
    this.state = {};
    this.data = data;
    this.row = m.prop(row);
  };

  List.view = function(ctrl) {
    var body, list, loaded, _ref;
    loaded = (ctrl.data() == null) || (ctrl != null ? (_ref = ctrl.data()) != null ? _ref.length : void 0 : void 0) > 0;
    if (ctrl.data() == null) {
      list = m("ul.trending-list.above.animation-bounce-up", m("li.text-center", "No results found"));
    } else if (loaded) {
      list = m("ul.trending-list.above.animation-bounce-up", ctrl.data().map(function(item, index) {
        return m("li", ctrl.row().map(function(cell) {
          if (typeof cell === "function") {
            console.log("fn");
            return m("div", cell(item));
          }
          return m("div", cell.attrs, cell.el(item));
        }));
      }));
    } else {
      list = m("ul");
    }
    body = m("div", [TempList(loaded), list]);
    return body;
  };

  TempList = function(loaded) {
    var anim, styl;
    anim = (function(_this) {
      return function(a, b, c) {
        console.log("here");
        if (loaded) {
          fadesOut(a, b, c);
        }
      };
    })(this);
    styl = loaded ? {
      style: {
        position: "absolute",
        width: "100%",
        zIndex: "-2"
      }
    } : void 0;
    return m("ul.temp-list.under", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function() {
      return m("li", [
        m("div", {
          style: {
            width: '30%',
            height: '50px',
            maxWidth: '100px'
          }
        }, [m("span.placeholder-yellow")]), m("div", {
          style: {
            width: '70%',
            height: '50px'
          }
        }, [m("span.placeholder-blue")])
      ]);
    }));
  };

  Table = {};

  Table.controller = function(header, row, data, state) {
    this.state = state != null ? state : {};
    this.data = (function(_this) {
      return function() {
        var sortMult;
        if (_this.state.sortType) {
          sortMult = {
            asc: 1,
            des: -1
          }[_this.state.sortDir];
          data.sort(function(a, b) {
            var aVal, bVal, result;
            aVal = a[_this.state.sortKey];
            bVal = b[_this.state.sortKey];
            result = 0;
            if (aVal > bVal) {
              result = 1;
            }
            if (aVal < bVal) {
              result = -1;
            }
            return result * sortMult;
          });
        }
        return data;
      };
    })(this);
    this.header = m.prop(header);
    this.row = m.prop(row);
    this.handleHeaderClick = (function(_this) {
      return function(e) {
        var sortKey, sortType;
        sortType = e.target.getAttribute('data-sort-type');
        sortKey = e.target.getAttribute('data-sort-key');
        if (sortType != null) {
          if (sortType === _this.state.sortType) {
            _this.state.sortDir = _this.state.sortDir === "asc" ? "des" : "asc";
          } else {
            _this.state.sortDir = "asc";
          }
          _this.state.sortType = sortType;
          _this.state.sortKey = sortKey;
        }
      };
    })(this);
  };

  Table.view = function(ctrl) {
    var body, head, headerAttrs;
    headerAttrs = function(item) {
      var attrs, _ref;
      attrs = {};
      if (item.type != null) {
        attrs['data-sort-type'] = item.type;
      }
      if (item.key != null) {
        attrs['data-sort-key'] = item.key;
      }
      attrs["class"] = ctrl.state.sortKey === item.key ? (_ref = ctrl.state.sortDir) != null ? _ref : "" : "";
      return attrs;
    };
    head = m("thead", {
      onclick: ctrl.handleHeaderClick
    }, [
      m("tr", ctrl.header().map(function(item, index) {
        return m("th", headerAttrs(item), item.label);
      }))
    ]);
    body = m("tbody", ctrl.data().map(function(item, index) {
      return m("tr", ctrl.row().map(function(cell) {
        if (typeof cell === "function") {
          return m("td", cell(item));
        }
        return m("td", cell.attrs, cell.el(item));
      }));
    }));
    return m("table", [head, body]);
  };

  Image = function(options) {
    if (options == null) {
      options = {};
    }
    return m("img", options);
  };

  m.route.mode = "search";

  m.route(document.body, "/", {
    "/": trendingPage,
    "/search/:keyword": searchPage
  });

}).call(this);
