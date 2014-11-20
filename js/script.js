(function() {
  var Image, List, Table, TempList, TrendingGame, TrendingTable, fadesOut, model, orLoading, searchInput, searchPage, slidesIn, slidesUp, styler, trendingPage, util;

  styler = {};

  styler.styleTable = function(root) {
    if (root.tag === "table") {
      root.attrs["class"] = "bordered";
    }
    return root;
  };

  styler.styleTableHeader = function(root, parent) {
    var item, _base, _i, _len;
    if (!root) {
      return root;
    } else if (root instanceof Array) {
      for (_i = 0, _len = root.length; _i < _len; _i++) {
        item = root[_i];
        this.styleTableHeader(item, parent);
      }
    } else if (root.children instanceof Array) {
      this.styleTableHeader(root.children, root);
    } else if (root.tag === "th" && root.attrs['data-sort-type']) {
      if ((_base = root.attrs)["class"] == null) {
        _base["class"] = "";
      }
      root.attrs["class"] += " clickable";
    }
    return root;
  };

  this.animating = false;

  orLoading = function(elements, loading) {
    console.log("here");
    console.log(loading);
    if (loading) {
      return [
        m("i", {
          "class": "icon ion-loading-c icon-large"
        })
      ];
    }
    return elements;
  };

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
        m("li", m("a", {
          config: m.route,
          onclick: closeNav
        }, "Trending")), m("li", m("div", "Item 2")), m("li", searchInput())
      ])), m("label[for=nav-expand].overlay")
    ];
  };

  searchInput = function(keyword) {
    var search;
    if (keyword == null) {
      keyword = "";
    }
    search = function(e) {
      var searchTerm;
      e.preventDefault();
      searchTerm = document.getElementById("search-input").value;
      document.getElementById("nav-expand").checked = "";
      m.route("/search/" + searchTerm);
    };
    return m("form", {
      onsubmit: search
    }, m("div.inner-addon.left-addon", [
      m("i.icon.ion-search"), m("input#search-input[type=text][name=search]", {
        value: keyword
      })
    ]));
  };

  model = {
    getData: function() {
      return m.request({
        method: 'Get',
        url: '/hot',
        type: TrendingGame,
        background: true
      });
    }
  };

  searchPage = {};

  searchPage.controller = function() {
    m.redraw.strategy("diff");
    this.term = m.route.param("keyword");
    console.log(this.term);
  };

  searchPage.view = function(ctrl) {
    return util.layout("Search", m('div.full-search.animation-bounce-in-right', searchInput(ctrl.term)));
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
    console.log("fade");
    console.log(element);
    console.log(element.style.opacity);
    console.log(element.style.opacity != null);
    if (element.style.opacity === "" || element.style.opacity === !0) {
      console.log("out");
      return $.Velocity(element, "transition.fadeOut");
    }
  };

  TrendingGame = function(data) {
    var _ref;
    this.name = data.name.value;
    this.thumbnail = data.thumbnail.value;
    this.rank = data.rank;
    this.year = data != null ? (_ref = data.yearpublished) != null ? _ref.value : void 0 : void 0;
  };

  TrendingTable = {};

  TrendingTable.controller = function(data) {
    var header, row;
    header = [
      {
        label: ""
      }, {
        label: "Name",
        key: "name",
        type: "string"
      }, {
        label: "Rank",
        key: "rank",
        type: "int"
      }
    ];
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
        el: function(data) {
          return [
            new Image({
              src: data.thumbnail,
              "class": 'img-center'
            })
          ];
        }
      }, {
        attrs: {
          style: {
            width: "60%",
            overflow: 'hidden',
            padding: '0 5px'
          }
        },
        el: function(data) {
          return [
            m("span.game-title--small", data.name + " "), m("small", {
              style: {
                display: "block"
              }
            }, data.year)
          ];
        }
      }, {
        attrs: {
          style: {
            textAlign: 'right',
            width: "10%",
            padding: "0 10px"
          }
        },
        el: function(data) {
          return data.rank;
        }
      }
    ];
    this.table = new List.controller(row, data);
  };

  TrendingTable.view = function(ctrl) {
    return new List.view(ctrl.table);
  };

  List = {};

  List.controller = function(row, data) {
    this.state = {};
    this.data = data;
    this.row = m.prop(row);
  };

  List.view = function(ctrl) {
    var body, list, loaded;
    loaded = (ctrl.data() != null) && ctrl.data().length > 0;
    if (loaded) {
      list = m("ul.trending-list.above.animation-bounce-up", ctrl.data().map(function(item, index) {
        return m("li", ctrl.row().map(function(cell) {
          if (typeof cell === "function") {
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
