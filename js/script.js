(function() {
  var Image, Table, TrendingGame, TrendingTable, model, orLoading, styler, trendingPage;

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

  trendingPage = {};

  trendingPage.controller = function() {
    this.games = m.prop([]);
    this.loading = m.prop(true);
    model.getData().then(this.games).then((function(_this) {
      return function() {
        console.log("loaded");
        _this.loading(false);
        _this.trendingTable = new TrendingTable.controller(_this.games());
      };
    })(this)).then(m.redraw);
  };

  trendingPage.view = function(ctrl) {
    var body;
    body = ctrl.loading() ? [
      m("div.text-center", [
        m("i", {
          "class": "icon ion-loading-c icon-large"
        })
      ])
    ] : [new TrendingTable.view(ctrl.trendingTable)];
    return m("div.main", body);
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
            textAlign: 'center'
          }
        },
        el: function(data) {
          return [
            new Image({
              src: data.thumbnail,
              "class": 'radius thumbnail'
            })
          ];
        }
      }, function(data) {
        return [m("span.game-title--small", [data.name, " ", m("small", data.year)])];
      }, {
        attrs: {
          style: {
            textAlign: 'right'
          }
        },
        el: function(data) {
          return data.rank;
        }
      }
    ];
    this.table = new Table.controller(header, row, data);
  };

  TrendingTable.view = function(ctrl) {
    return styler.styleTableHeader(styler.styleTable(new Table.view(ctrl.table)));
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
    "/": trendingPage
  });

}).call(this);
