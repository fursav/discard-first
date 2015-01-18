(function() {
  var BoardGame, GameSummary, Icon, Image, List, Mobile3ColList, NameView, PlainList, QuickStat, SearchResult, SearchTable, TempList, TrendingGame, TrendingTable, gameOverviewPage, model, searchInput, searchPage, trendingPage, util;

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
    getInitialBoardGameData: function(id) {
      return m.request({
        method: 'Get',
        url: "/thing?id=" + id + "&stats=1",
        type: BoardGame,
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

  gameOverviewPage = {};

  gameOverviewPage.controller = function() {
    this.gameId = m.route.param("id");
    this.gameData = m.prop();
    model.getInitialBoardGameData(this.gameId).then(this.gameData).then(m.redraw);
  };

  gameOverviewPage.view = function(ctrl) {
    var nameView, _ref;
    console.log(ctrl.gameData());
    nameView = GameSummary(ctrl.gameData());
    return util.layout((_ref = ctrl.gameData()) != null ? _ref.name : void 0, nameView);
  };

  NameView = function(data) {
    var img, quickStats;
    console.log(data);
    if ((data != null ? data.thumbnail : void 0) != null) {
      img = new Image({
        src: data.thumbnail,
        "class": 'img-center2'
      });
    } else {
      img = "";
    }
    quickStats = "";
    return m("div", [img, qui]);
  };

  GameSummary = function(data) {
    var img, quickStats, stats;
    console.log(data);
    if ((data != null ? data.thumbnail : void 0) != null) {
      img = new Image({
        src: data.thumbnail
      });
    } else {
      img = "";
    }
    stats = [];
    stats.push([".ion-speedometer", parseFloat(data != null ? data.getStat("bayesaverage").toFixed(1) : void 0)]);
    stats.push([".ion-calendar", data != null ? data.year : void 0]);
    stats.push([".ion-person-stalker", data != null ? data.numplayers : void 0]);
    stats.push([".ion-person", (data != null ? data.minage : void 0) + "+"]);
    stats.push([".ion-clock", (data != null ? data.playingtime : void 0) + " mins"]);
    quickStats = PlainList(stats.map(function(item, index) {
      return QuickStat(item[0], item[1]);
    }), ".no-bullet");
    return m("div.game-summary.animation-bounce-up", [m("div.game-img", img), quickStats]);
  };

  QuickStat = function(iconClass, value) {
    return m("div.quick-stat", [new Icon(iconClass), value]);
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

  BoardGame = function(data) {
    var populate;
    console.log(data);
    populate = (function(_this) {
      return function(data) {
        var _ref, _ref1, _ref2, _ref3;
        if (data != null) {
          _this.id = data != null ? data.id : void 0;
          _this.name = (data != null ? data.name : void 0) instanceof Array ? data != null ? data.name[0].value : void 0 : data != null ? (_ref = data.name) != null ? _ref.value : void 0 : void 0;
          _this.thumbnail = (data != null ? (_ref1 = data.thumbnail) != null ? _ref1.value : void 0 : void 0) || (data != null ? data.thumbnail : void 0);
          _this.year = data != null ? (_ref2 = data.yearpublished) != null ? _ref2.value : void 0 : void 0;
          _this.statistics = data != null ? data.statistics : void 0;
          _this.numplayers = (data != null ? data.minplayers.value : void 0) === (data != null ? data.maxplayers.value : void 0) ? data != null ? data.minplayers.value : void 0 : "" + (data != null ? data.minplayers.value : void 0) + " - " + (data != null ? data.maxplayers.value : void 0);
          _this.minage = data != null ? (_ref3 = data.minage) != null ? _ref3.value : void 0 : void 0;
          _this.playingtime = data != null ? data.playingtime.value : void 0;
        }
      };
    })(this);
    this.getStat = function(name) {
      var _ref, _ref1, _ref2;
      return (_ref = this.statistics) != null ? (_ref1 = _ref.ratings) != null ? (_ref2 = _ref1[name]) != null ? _ref2.value : void 0 : void 0 : void 0;
    };
    populate(data);
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
    this.id = data != null ? data.id : void 0;
    this.name = data.name.value;
    this.thumbnail = data.thumbnail.value;
    this.rank = data.rank;
    this.year = data != null ? (_ref = data.yearpublished) != null ? _ref.value : void 0 : void 0;
  };

  SearchTable = {};

  SearchTable.controller = function(data) {
    var elements, rowOnClick;
    elements = [
      function(game) {
        if (game.thumbnail != null) {
          return new Image({
            src: game.thumbnail,
            "class": 'img-center'
          });
        } else {
          return "";
        }
      }, function(game) {
        return [
          m("span.game-title--small", game.name + " "), m("small", {
            style: {
              display: "block"
            }
          }, game.year)
        ];
      }, function(game) {
        var num;
        num = parseFloat(game.getStat("bayesaverage")).toFixed(1);
        if (!isNaN(num)) {
          return num;
        } else {
          return "";
        }
      }
    ];
    rowOnClick = function(e, item) {
      m.route("/bg/" + item.id);
    };
    this.table = new Mobile3ColList.controller(elements, data, rowOnClick);
  };

  SearchTable.view = function(ctrl) {
    return new Mobile3ColList.view(ctrl.table);
  };

  TrendingTable = {};

  TrendingTable.controller = function(data) {
    var elements, rowOnClick;
    elements = [
      function(data) {
        if (data.thumbnail != null) {
          return new Image({
            src: data.thumbnail,
            "class": 'img-center'
          });
        } else {
          return "";
        }
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
    rowOnClick = function(e, item) {
      m.route("/bg/" + item.id);
    };
    this.table = new Mobile3ColList.controller(elements, data, rowOnClick);
  };

  TrendingTable.view = function(ctrl) {
    return new Mobile3ColList.view(ctrl.table);
  };

  Mobile3ColList = {};

  Mobile3ColList.controller = function(elements, data, rowOnClick) {
    var row;
    row = [
      {
        classes: ".img-col",
        el: elements[0]
      }, {
        classes: ".main-col",
        el: elements[1]
      }, {
        classes: ".num-col",
        el: elements[2]
      }
    ];
    this.table = new List.controller(row, data, rowOnClick);
  };

  Mobile3ColList.view = function(ctrl) {
    return new List.view(ctrl.table);
  };

  List = {};

  List.controller = function(row, data, rowOnClick) {
    this.rowOnClick = rowOnClick;
    this.state = {};
    this.row = m.prop(row);
    this.data = data;
  };

  List.view = function(ctrl) {
    var body, list, loaded, _ref;
    loaded = (ctrl.data() == null) || (ctrl != null ? (_ref = ctrl.data()) != null ? _ref.length : void 0 : void 0) > 0;
    if (ctrl.data() == null) {
      list = m("ul.trending-list.animation-bounce-up", m("li.text-center", "No results found"));
    } else if (loaded) {
      list = m("ul.trending-list.animation-bounce-up", ctrl.data().map(function(item, index) {
        return m("li", ctrl.rowOnClick != null ? {
          onclick: function(e) {
            return ctrl.rowOnClick(e, item);
          }
        } : void 0, ctrl.row().map(function(cell) {
          var element;
          element = "div" + (cell.classes != null ? cell.classes : "");
          return m(element, cell.attrs, cell.el(item));
        }));
      }));
    } else {
      list = m("ul");
    }
    body = m("div", [TempList(), list]);
    return body;
  };

  PlainList = function(items, classes) {
    if (classes == null) {
      classes = "";
    }
    return m("ul" + classes, items.map(function(item, index) {
      return m("li", item);
    }));
  };

  TempList = function() {
    return m("ul.temp-list.under", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function() {
      return m("li", [m("div.img-col", m("span.placeholder-yellow")), m("div.main-col", m("span.placeholder-blue"))]);
    }));
  };

  Image = function(options) {
    if (options == null) {
      options = {};
    }
    return m("img", options);
  };

  Icon = function(classes) {
    if (classes == null) {
      classes = "";
    }
    return m("i.icon." + classes);
  };

  m.route.mode = "search";

  m.route(document.body, "/", {
    "/": trendingPage,
    "/search/:keyword": searchPage,
    "/bg/:id": gameOverviewPage
  });

}).call(this);
