(function() {
  var BoardGame, GameComment, GameDescription, GameDescriptionSkeleton, GameDetails, GameStats, GameSummary, GameSummarySkeleton, Icon, Image, List, Mobile3ColList, PlainList, QuickStat, SearchResult, SearchTable, TempList, TrendingGame, TrendingTable, gameDetailsPage, gameOverviewPage, gameStatsPage, model, searchInput, searchPage, trendingPage, util;

  util = {};

  util.layout = function(title, body) {
    return m("#wrap", [util.header(title), util.nav(), m("main", body)]);
  };

  util.gameLayout = function(game, body) {
    var _ref;
    return m("#wrap", [util.header((_ref = game()) != null ? _ref.name : void 0, new Icon(".icon-large.ion-chevron-right")), util.nav(), util.gameNav(game), m("main", body)]);
  };

  util.header = function(title, rightIcon) {
    var right;
    if (rightIcon) {
      right = m("label.nav-btn", {
        "for": "nav-secondary"
      }, rightIcon);
    } else {
      right = "";
    }
    return m("header.banner", [
      m("div.banner-left", m("label.nav-btn", {
        "for": "nav-expand"
      }, m("i.icon.icon-large.ion-navicon"))), m("div.banner-center", title), m("div.banner-right", right)
    ]);
  };

  util.gameNav = function(game) {
    var closeNav, _ref, _ref1, _ref2;
    closeNav = function(e) {
      document.getElementById("nav-secondary").checked = false;
    };
    return [
      m("input#nav-secondary[name=nav][type=checkbox][checked=''].invisible"), m("nav.off-canvas-secondary", m("div.off-canvas-title.text-right", m("label[for=nav-secondary].nav-btn", m("i.icon.icon-large.ion-close"))), m("ul.no-bullet.off-canvas-nav", {
        onclick: closeNav
      }, [
        m("li", m("a.clickable", {
          href: "/bg/" + ((_ref = game()) != null ? _ref.id : void 0),
          config: m.route
        }, "Overview")), m("li", m("a.clickable", {
          href: "/bg/" + ((_ref1 = game()) != null ? _ref1.id : void 0) + "/details",
          config: m.route
        }, "Details")), m("li", m("a.clickable", {
          href: "/bg/" + ((_ref2 = game()) != null ? _ref2.id : void 0) + "/stats",
          config: m.route
        }, "Statistics"))
      ])), m("label[for=nav-secondary].overlay")
    ];
  };

  util.nav = function() {
    var closeNav;
    closeNav = function() {
      document.getElementById("nav-expand").checked = false;
      m.route("/");
    };
    return [
      m("input#nav-expand[name=nav][type=checkbox][checked=''].invisible"), m("nav.off-canvas", m("div.off-canvas-title", m("label[for=nav-expand].nav-btn", m("i.icon.icon-large.ion-close"))), m("ul.no-bullet.off-canvas-nav", [
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

  gameStatsPage = {};

  gameStatsPage.controller = function() {
    this.gameId = m.route.param("id");
    this.gameData = m.prop();
    model.getInitialBoardGameData(this.gameId).then(this.gameData).then(m.redraw).then((function(_this) {
      return function() {
        model.getGameData(_this.gameId, {
          comments: 1
        }).then(function(x) {
          return _this.gameData().putComments(x.comments);
        }).then(m.redraw);
      };
    })(this));
  };

  gameStatsPage.view = function(ctrl) {
    var commentView, page, statsViev;
    console.log(ctrl.gameData());
    statsViev = GameStats(ctrl.gameData());
    commentView = GameComment(ctrl.gameData());
    page = m("div", [statsViev, commentView]);
    return util.gameLayout(ctrl.gameData, page);
  };

  gameDetailsPage = {};

  gameDetailsPage.controller = function() {
    this.gameId = m.route.param("id");
    this.gameData = m.prop();
    model.getInitialBoardGameData(this.gameId).then(this.gameData).then(m.redraw);
  };

  gameDetailsPage.view = function(ctrl) {
    var detailsView, page;
    console.log(ctrl.gameData());
    detailsView = GameDetails(ctrl.gameData());
    page = m("div", detailsView);
    return util.gameLayout(ctrl.gameData, page);
  };

  gameOverviewPage = {};

  gameOverviewPage.controller = function() {
    this.gameId = m.route.param("id");
    this.gameData = m.prop();
    model.getInitialBoardGameData(this.gameId).then(this.gameData).then(m.redraw);
  };

  gameOverviewPage.view = function(ctrl) {
    var descriptionView, nameView, page;
    console.log(ctrl.gameData());
    nameView = GameSummary(ctrl.gameData());
    descriptionView = GameDescription(ctrl.gameData());
    page = m("div", [nameView, descriptionView]);
    return util.gameLayout(ctrl.gameData, page);
  };

  GameComment = function(game) {
    var body, comment, content, loaded;
    loaded = (game != null ? game.comments : void 0) != null;
    if (loaded) {
      comment = game.getFeaturedComment();
      content = m("div.animation-bounce-up", [m("div", comment.rating), m("div", comment.value), m("div", comment.username)]);
    } else {
      content = m("div");
    }
    return body = m("div.container.section", [m("div.subheader", "Featured Rating"), content]);
  };

  GameStats = function(game) {
    var body, content, loaded, ranks, stats;
    loaded = (game != null ? game.id : void 0) != null;
    if (loaded) {
      ranks = game.getRanks();
      stats = [["Average Rating", game.getStat("bayesaverage").toFixed(1)], ["Number Of Ratings", game.getStat("usersrated")]];
      stats = ranks.concat(stats);
      content = PlainList(stats.map(function(item) {
        return [m("div.label", item[0]), m("div.value", item[1])];
      }), ".no-bullet.stats.animation-bounce-up");
    } else {
      content = m("div");
    }
    return body = m("div.container.section", [m("div.subheader", "Statistics"), content]);
  };

  GameDetails = function(game) {
    var body, content, details, loaded;
    loaded = (game != null ? game.id : void 0) != null;
    if (loaded) {
      details = [["Designer", game.designer], ["Artist", game.artist], ["Publisher", game.publisher], ["Category", game.category], ["Mechanic", game.mechanic]];
      content = PlainList(details.map(function(item) {
        return [m("div.label", item[0]), PlainList(item[1], ".no-bullet.value")];
      }), ".no-bullet.details.animation-bounce-up");
    } else {
      content = m("div");
    }
    return body = m("div.container.section", [m("div.subheader", "Details"), content]);
  };

  GameSummary = function(data) {
    var body, content, img, loaded, quickStats, stats;
    loaded = (data != null ? data.id : void 0) != null;
    if (loaded) {
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
      content = m("div.game-summary.section.animation-bounce-up", [m("div.game-img", img), quickStats]);
    } else {
      content = m("div");
    }
    body = m("div.container", [GameSummarySkeleton(), content]);
    return body;
  };

  GameDescription = function(game) {
    var body, content, loaded;
    loaded = game != null ? game.id : void 0;
    if (loaded) {
      content = m("div.section.animation-bounce-up", m.trust(game != null ? game.description : void 0));
    } else {
      content = m("div");
    }
    body = m("div.container", [GameDescriptionSkeleton(), content]);
    return body;
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
    var getHTMLString, getLinks, populate;
    console.log(data);
    getHTMLString = (function(_this) {
      return function(string) {
        var htmlString, regex;
        if (string == null) {
          return string;
        }
        htmlString = string;
        regex = new RegExp("&#10;&#10;    ", "g");
        htmlString = htmlString.replace(regex, "</br></br><ul><li>");
        regex = new RegExp("&#10;&#10;&#10;", "g");
        htmlString = htmlString.replace(regex, "</li></ul></br>");
        regex = new RegExp("&#10;    ", "g");
        htmlString = htmlString.replace(regex, "</li><li>");
        regex = new RegExp("&#10;&#10;", "g");
        htmlString = htmlString.replace(regex, "</br></br>");
        regex = new RegExp(_this.name, "g");
        htmlString = htmlString.replace(regex, "<b>" + _this.name + "</b>");
        return htmlString;
      };
    })(this);
    getLinks = function(links, type) {
      var link, results;
      return results = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = links.length; _i < _len; _i++) {
          link = links[_i];
          if (link.type === type) {
            _results.push(link.value);
          }
        }
        return _results;
      })();
    };
    populate = (function(_this) {
      return function(data) {
        var populateLinks, _ref, _ref1, _ref2, _ref3;
        populateLinks = function() {
          var link, _i, _len, _ref, _results;
          _ref = data != null ? data.link : void 0;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            link = _ref[_i];
            switch (link.type) {
              case "boardgamedesigner":
                _results.push(_this.designer.push(link.value));
                break;
              case "boardgameartist":
                _results.push(_this.artist.push(link.value));
                break;
              case "boardgamepublisher":
                _results.push(_this.publisher.push(link.value));
                break;
              case "boardgamecategory":
                _results.push(_this.category.push(link.value));
                break;
              case "boardgamemechanic":
                _results.push(_this.mechanic.push(link.value));
                break;
              default:
                _results.push(void 0);
            }
          }
          return _results;
        };
        if (data != null) {
          _this.id = data != null ? data.id : void 0;
          _this.name = (data != null ? data.name : void 0) instanceof Array ? data != null ? data.name[0].value : void 0 : data != null ? (_ref = data.name) != null ? _ref.value : void 0 : void 0;
          _this.thumbnail = (data != null ? (_ref1 = data.thumbnail) != null ? _ref1.value : void 0 : void 0) || (data != null ? data.thumbnail : void 0);
          _this.year = data != null ? (_ref2 = data.yearpublished) != null ? _ref2.value : void 0 : void 0;
          _this.description = getHTMLString(data != null ? data.description : void 0);
          _this.statistics = data != null ? data.statistics : void 0;
          _this.numplayers = (data != null ? data.minplayers.value : void 0) === (data != null ? data.maxplayers.value : void 0) ? data != null ? data.minplayers.value : void 0 : "" + (data != null ? data.minplayers.value : void 0) + " - " + (data != null ? data.maxplayers.value : void 0);
          _this.minage = data != null ? (_ref3 = data.minage) != null ? _ref3.value : void 0 : void 0;
          _this.playingtime = data != null ? data.playingtime.value : void 0;
          _this.designer = [];
          _this.artist = [];
          _this.publisher = [];
          _this.category = [];
          _this.mechanic = [];
          populateLinks();
        }
      };
    })(this);
    this.getRanks = function() {
      var rank;
      return (function() {
        var _i, _len, _ref, _ref1, _ref2, _ref3, _results;
        _ref3 = (_ref = this.statistics) != null ? (_ref1 = _ref.ratings) != null ? (_ref2 = _ref1.ranks) != null ? _ref2.rank : void 0 : void 0 : void 0;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          rank = _ref3[_i];
          _results.push([rank.friendlyname, rank.value]);
        }
        return _results;
      }).call(this);
    };
    this.getStat = function(name) {
      var _ref, _ref1, _ref2;
      return (_ref = this.statistics) != null ? (_ref1 = _ref.ratings) != null ? (_ref2 = _ref1[name]) != null ? _ref2.value : void 0 : void 0 : void 0;
    };
    this.putComments = function(comments) {
      var comment;
      this.comments = comments.comment;
      this.goodComments = (function() {
        var _i, _len, _ref, _results;
        _ref = this.comments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          comment = _ref[_i];
          if (comment.value.length > 119 && parseInt(comment.rating) > 0) {
            _results.push(comment);
          }
        }
        return _results;
      }).call(this);
    };
    this.getFeaturedComment = function() {
      return this.goodComments[Math.floor(Math.random() * this.goodComments.length)];
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

  GameSummarySkeleton = function() {
    var stats;
    stats = [".ion-speedometer", ".ion-calendar", ".ion-person-stalker", ".ion-person", ".ion-clock"];
    stats = PlainList(stats.map(function(item, index) {
      return QuickStat(item, "");
    }), ".no-bullet");
    return m("div.game-summary.under", [m("div.game-img", m("span.placeholder-img.placeholder-yellow")), stats]);
  };

  GameDescriptionSkeleton = function() {
    var sample;
    sample = [m("p", "Game description from the publisher:"), m("p", "Crossroads is a new series from Plaid Hat Games that tests a group of survivors' ability to work together and stay alive while facing crises and challenges from both outside and inside."), m("p", "Dead of Winter: A Crossroads Game, the first game in this series, puts 2-5 players")];
    return m("div.placeholder-description.under.section", sample);
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
    "/bg/:id/details": gameDetailsPage,
    "/bg/:id/stats": gameStatsPage,
    "/bg/:id": gameOverviewPage
  });

}).call(this);
