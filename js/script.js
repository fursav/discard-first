(function() {
  var BoardGame, ViewModel, loadFromCache, saveToCache,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var alert, nav;
    nav = responsiveNav(".nav-collapse", {
      animate: true,
      transition: 284,
      label: ""
    });
    $("#nav").onePageNav({
      currentClass: "active"
    });
    window.vm = new ViewModel();
    ko.applyBindings(window.vm);
    if (!((Modernizr.flexbox || Modernizr.flexboxlegacy) && Modernizr.mq('only all'))) {
      alert = "<h4 class='alert-title'>Unsupported Browser</h4> You are using an unsupported browser!" + " Majority of the site features will be broken. It is recommended that you upgrade your browser." + "<p><strong>Supported Browsers:</strong></p>Opera 12.1+, Firefox 22+, Chrome 21+, Safari 6.1+.";
      vex.dialog.alert(alert);
    }
  });

  saveToCache = function(type, key, data) {
    if (Modernizr.sessionstorage) {
      sessionStorage["" + type + "_" + key] = ko.toJSON(data);
    }
  };

  loadFromCache = function(type, key) {
    var data;
    if (Modernizr.sessionstorage) {
      data = sessionStorage["" + type + "_" + key];
      if (data) {
        data = JSON.parse(data);
      }
      return data;
    }
  };

  BoardGame = (function() {
    function BoardGame(data) {
      this.getForumVisible = __bind(this.getForumVisible, this);
      this.deselectThread = __bind(this.deselectThread, this);
      this.getThreadPost = __bind(this.getThreadPost, this);
      this.selectThread = __bind(this.selectThread, this);
      this.deselectForum = __bind(this.deselectForum, this);
      this.selectForum = __bind(this.selectForum, this);
      this.id = "";
      this.image = ko.observable();
      this.description = ko.observable();
      this.thumbnail = ko.observable();
      this.link = ko.observable();
      this.maxplayers = ko.observable();
      this.minage = ko.observable();
      this.minplayers = ko.observable();
      this.name = ko.observable();
      this.playingtime = ko.observable();
      this.statistics = ko.observable();
      this.yearpublished = ko.observable();
      this.rank = ko.observable();
      this.dataInfo = {};
      this.comments = [];
      this.commentsData = {};
      this.forums = [];
      this.selectedForum = ko.observable();
      this.selectedThread = ko.observable();
      this.featuredComment = ko.observable();
      this.updated = ko.observable();
      this.updateData(data);
    }

    BoardGame.prototype.updateData = function(data) {
      var k, updateProp, v, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      updateProp = function(prop, propData) {
        if (propData) {
          prop(propData);
        }
      };
      this.id = (_ref = data.id) != null ? _ref : this.id;
      updateProp(this.image, data.image);
      updateProp(this.description, data.description);
      this.thumbnail((_ref1 = ($.type(data.thumbnail) === "object" ? data.thumbnail.value : data.thumbnail)) != null ? _ref1 : this.thumbnail);
      updateProp(this.link, data.link);
      updateProp(this.maxplayers, data.maxplayers);
      updateProp(this.minage, data.minage);
      updateProp(this.minplayers, data.minplayers);
      updateProp(this.name, data.name);
      updateProp(this.playingtime, data.playingtime);
      updateProp(this.statistics, data.statistics);
      updateProp(this.yearpublished, data.yearpublished);
      updateProp(this.rank, data.rank);
      this.comments = (_ref2 = data.comments) != null ? _ref2 : this.comments;
      this.commentsData = (_ref3 = data.commentsData) != null ? _ref3 : this.commentsData;
      this.forums = (_ref4 = data.forums) != null ? _ref4 : this.forums;
      _ref5 = data.dataInfo;
      for (k in _ref5) {
        v = _ref5[k];
        this.dataInfo[k] = v;
      }
      this.updated(Date.now());
      return this.cacheData();
    };

    BoardGame.prototype.getData = function() {
      return {
        "id": this.id,
        "image": this.image(),
        "description": this.description(),
        "thumbnail": this.thumbnail(),
        "link": this.link(),
        "maxplayers": this.maxplayers(),
        "minage": this.minage(),
        "minplayers": this.minplayers(),
        "name": this.name(),
        "playingtime": this.playingtime(),
        "statistics": this.statistics(),
        "yearpublished": this.yearpublished(),
        "rank": this.rank(),
        "comments": this.comments,
        "commentsData": this.commentsData,
        "forums": this.forums,
        "dataInfo": this.dataInfo,
        "updated": this.updated()
      };
    };

    BoardGame.prototype.cacheData = function() {
      return saveToCache("boardgame", this.id, this.getData());
    };

    BoardGame.prototype.getRanks = function() {
      return this.statistics().ratings.ranks.rank;
    };

    BoardGame.prototype.getRank = function(name) {
      var rank, _i, _len, _ref, _results;
      console.log(name);
      _ref = this.getRanks();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rank = _ref[_i];
        if (rank.name === name) {
          _results.push(parseInt(rank.value));
        }
      }
      return _results;
    };

    BoardGame.prototype.getTopRank = function() {
      var rank, _i, _len, _ref, _results;
      _ref = this.getRanks();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rank = _ref[_i];
        if (rank.name === "boardgame") {
          _results.push(parseInt(rank.value));
        }
      }
      return _results;
    };

    BoardGame.prototype.getAverageRating = function() {
      var _ref, _ref1, _ref2;
      return (_ref = this.statistics()) != null ? (_ref1 = _ref.ratings) != null ? (_ref2 = _ref1.average) != null ? _ref2.value : void 0 : void 0 : void 0;
    };

    BoardGame.prototype.getBRating = function() {
      var _ref, _ref1, _ref2;
      return (_ref = this.statistics()) != null ? (_ref1 = _ref.ratings) != null ? (_ref2 = _ref1.bayesaverage) != null ? _ref2.value : void 0 : void 0 : void 0;
    };

    BoardGame.prototype.getCategories = function() {
      var categories, link, _i, _len, _ref;
      categories = [];
      _ref = this.link();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        if (link["type"] === "boardgamecategory") {
          categories.push(link["value"]);
        }
      }
      return categories;
    };

    BoardGame.prototype.getDesigner = function() {
      var link, _i, _len, _ref;
      _ref = this.link();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        if (link["type"] === "boardgamedesigner") {
          return link["value"];
        }
      }
    };

    BoardGame.prototype.getNumPlayers = function() {
      if (this.maxplayers().value === this.minplayers().value) {
        return this.maxplayers().value;
      } else {
        return "" + (this.minplayers().value) + " - " + (this.maxplayers().value);
      }
    };

    BoardGame.prototype.getName = function() {
      if ($.type(this.name()) === "array") {
        return this.name()[0].value;
      }
      return this.name().value;
    };

    BoardGame.prototype.getShortName = function() {
      var list;
      list = this.getName().split('(')[0].split('–')[0].split(' ');
      if (list.length > 3) {
        list = list.slice(0, 3);
        list.push('...');
        return list.join(' ');
      }
      return list.join(' ');
    };

    BoardGame.prototype.getShortDescription = function() {
      return this.description().slice(0, 100) + "...";
    };

    BoardGame.prototype.getHTMLDescription = function() {
      var contenthid, htmlDescription, i, paragraphs, regex;
      paragraphs = 1;
      contenthid = false;
      htmlDescription = this.description();
      regex = new RegExp("&#10;&#10;    ", "g");
      htmlDescription = htmlDescription.replace(regex, "<ul><li>");
      regex = new RegExp("&#10;&#10;&#10;", "g");
      htmlDescription = htmlDescription.replace(regex, "</li></ul>");
      regex = new RegExp("&#10;    ", "g");
      htmlDescription = htmlDescription.replace(regex, "</li><li>");
      htmlDescription = "<p>" + htmlDescription;
      regex = new RegExp("&#10;&#10;", "g");
      htmlDescription = htmlDescription.replace(regex, "</p><p>");
      htmlDescription += "</p>";
      i = 0;
      while (i < htmlDescription.length) {
        if (htmlDescription.slice(i, i + 3) === "<p>" || htmlDescription.slice(i - 5, i) === "</ul>") {
          paragraphs += 1;
          if ((paragraphs > 3 && i > 600 && htmlDescription.length - i > 7) && contenthid === false) {
            htmlDescription = htmlDescription.slice(0, i) + "<div class='full-description' style='display:none'>" + htmlDescription.slice(i, htmlDescription.length);
            contenthid = true;
            break;
          }
        }
        i++;
      }
      if (contenthid) {
        htmlDescription += "</div><button class='link link-wide' onclick=$('.full-description').toggle(function(){$('.show-more').toggleClass('ion-chevron-up')});><i class='show-more icon ion-chevron-down icon-large'></i></button>";
      }
      regex = new RegExp(this.getName(), "g");
      htmlDescription = htmlDescription.replace(regex, "<b>" + this.getName() + "</b>");
      return htmlDescription;
    };

    BoardGame.prototype.getRankLink = function(name, id, value) {
      if (name === "boardgame") {
        return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
      }
      return "http://boardgamegeek.com/" + name + "/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
    };

    BoardGame.prototype.selectForum = function(forum) {
      console.log("select forum");
      this.selectedForum(forum);
    };

    BoardGame.prototype.deselectForum = function() {
      this.selectedForum(null);
    };

    BoardGame.prototype.selectThread = function(thread) {
      console.log("select thread");
      $.getJSON("thread/" + thread.id, (function(_this) {
        return function(data) {
          console.log(data);
          _this.selectedThread(data);
          $(document).ready(function() {
            $('.thread-title').waypoint('sticky');
            $('.thread-title').css("width", $('.thread-title').outerWidth());
            $('html, body').animate({
              scrollTop: $('#forums').offset().top
            }, 300);
          });
        };
      })(this));
    };

    BoardGame.prototype.getThreadPost = function(articles) {
      if (articles[0] != null) {
        return articles[0].body;
      } else {
        return articles.body;
      }
    };

    BoardGame.prototype.deselectThread = function() {
      this.selectedThread(null);
      $('html, body').animate({
        scrollTop: $('#forums').offset().top
      }, 300);
    };

    BoardGame.prototype.getForumVisible = function() {
      if (this.selectedForum() && !this.selectedThread()) {
        return true;
      }
      return false;
    };

    return BoardGame;

  })();

  ViewModel = (function() {
    function ViewModel() {
      this.updateTableHeaders = __bind(this.updateTableHeaders, this);
      this.getIntFromDate = __bind(this.getIntFromDate, this);
      this.sortColumn = __bind(this.sortColumn, this);
      this.goToGame = __bind(this.goToGame, this);
      this.goToGameComments = __bind(this.goToGameComments, this);
      var self;
      self = this;
      this.loading = ko.observable(null);
      this.sortDirection = -1;
      this.currentSort = 'brating';
      this.gameTypes = [
        {
          key: 'boardgame',
          name: "Overall"
        }, {
          key: 'partygames',
          name: 'Party'
        }, {
          key: 'abstracts',
          name: 'Abstract'
        }, {
          key: 'cgs',
          name: 'Customizable'
        }, {
          key: 'childrensgames',
          name: "Children"
        }, {
          key: 'familygames',
          name: 'Family'
        }, {
          key: 'strategygames',
          name: 'Strategy'
        }, {
          key: 'thematic',
          name: 'Thematic'
        }, {
          key: 'wargames',
          name: 'War'
        }
      ];
      this.currentPage = ko.observable();
      this.currentPageTitle = ko.computed((function(_this) {
        return function() {
          switch (_this.currentPage()) {
            case "searchGames":
              return 'Search Results';
            case "gameComments":
              return 'Game Comments';
            case "gameOverview":
              return 'Game Overview';
            case "hotGames":
              return '';
            case "topGames":
              return 'Top Games';
          }
        };
      })(this));
      this.boardGames = {
        "updated": ko.observable()
      };
      this.searchedGames = ko.observableArray([]);
      this.searchedGamesList = ko.computed((function(_this) {
        return function() {
          var id, list, _i, _len, _ref;
          _this.boardGames.updated();
          list = [];
          _ref = _this.searchedGames();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            if (_this.boardGames[id] != null) {
              list.push(_this.boardGames[id]);
            }
          }
          console.log(list);
          list.sort(function(a, b) {
            if (a.getBRating() < b.getBRating()) {
              return 1;
            }
            if (a.getBRating() > b.getBRating()) {
              return -1;
            }
            return 0;
          });
          return list;
        };
      })(this));
      this.hotGames = ko.observableArray([]);
      this.topGamesType = ko.observable();
      this.topGames = ko.observableArray([]);
      this.dataTimeStamp = ko.observable();
      $.getJSON('json/top100.json', (function(_this) {
        return function(data) {
          return _this.dataTimeStamp(data.date);
        };
      })(this));
      this.selectedGame = ko.observable();
      Sammy(function() {
        this.get(/#search\/(.*)/, function() {
          self.selectedGame(null);
          self.searchGames(this.params.splat[0]);
          self.currentPage("searchGames");
        });
        this.get(/#game\/(\w*)$/, function() {
          self.currentPage("gameOverview");
          self.searchedGames.removeAll();
          self.getGameDetails(this.params.splat[0]);
        });
        this.get(/#game\/(\w*)\/comments\/page\/(\w*)/, function() {
          self.getGameDetails(this.params.splat[0], this.params.splat[1]);
          self.currentPage("gameComments");
        });
        this.get("#topgames/:gameType", function() {
          self.topGamesType(this.params.gameType);
          self.selectedGame(null);
          self.searchedGames.removeAll();
          self.topGames.removeAll();
          self.getTopGames(this.params.gameType);
          self.currentPage("topGames");
        });
        this.get("", function() {
          this.title = "Hello";
          self.selectedGame(null);
          self.searchedGames.removeAll();
          self.getHotItems();
          self.currentPage("hotGames");
        });
        this.get("/", function() {
          console.log("dead");
        });
      }).run();
    }

    ViewModel.prototype.goToGameComments = function() {
      var x;
      x = this.selectedGame().commentsPage();
      location.hash = "game/" + (this.selectedGame().id) + "/comments/page/" + x;
      $("html, body").animate({
        scrollTop: 0
      }, "slow");
    };

    ViewModel.prototype.goToSearch = function() {
      var str;
      str = encodeURIComponent($("#search").val());
      location.hash = "search/" + str;
    };

    ViewModel.prototype.goToGame = function(object) {
      location.hash = "game/" + object.id;
      $("html, body").animate({
        scrollTop: 0
      }, "slow");
    };

    ViewModel.prototype.sortColumn = function(object, event) {
      var $table, column, sortDir, th, thIndex, trs, type;
      th = $(event.target);
      $table = th.closest("table");
      thIndex = th.index();
      trs = $table.children("tbody").children("tr");
      column = [];
      sortDir = th.hasClass("sorting-desc") ? 1 : -1;
      type = th.data("sort");
      trs.each(function(index, tr) {
        var $e, order_by, sort_val;
        $e = $(tr).children().eq(thIndex);
        sort_val = $e.data("sort-value");
        order_by = typeof sort_val === !"undefined" ? sort_val : $e.text();
        column.push([order_by, tr]);
      });
      column.sort((function(_this) {
        return function(a, b) {
          var date1, date2;
          switch (type) {
            case "float":
              return sortDir * (parseFloat(a[0], 10) - parseFloat(b[0], 10));
            case "int":
              return sortDir * (parseInt(a[0], 10) - parseInt(b[0], 10));
            case "date":
              date1 = a[0] === "0" ? 0 : _this.getIntFromDate(a[0]);
              date2 = b[0] === "0" ? 0 : _this.getIntFromDate(b[0]);
              return sortDir * (date1 - date2);
            default:
              if (a[0] < b[0]) {
                return sortDir * -1;
              }
              if (a[0] > b[0]) {
                return sortDir;
              }
              return 0;
          }
        };
      })(this));
      trs = $.map(column, function(kv) {
        return kv[1];
      });
      $table.children("tbody").append(trs);
      th.siblings().removeClass("sorting-desc sorting-asc");
      th.removeClass("sorting-desc sorting-asc");
      if (sortDir === 1) {
        th.addClass("sorting-asc");
      } else {
        th.addClass('sorting-desc');
      }
    };

    ViewModel.prototype.getIntFromDate = function(date) {
      return parseInt(date.slice(-4) + this.getNumFromMonth(date.slice(8, -5)) + date.slice(5, 7), 10);
    };

    ViewModel.prototype.getNumFromMonth = function(month) {
      switch (month.toLowerCase()) {
        case "jan":
          return "00";
        case "feb":
          return "01";
        case "mar":
          return "02";
        case "apr":
          return "03";
        case "may":
          return "04";
        case "jun":
          return "05";
        case "jul":
          return "06";
        case "aug":
          return "07";
        case "sep":
          return "08";
        case "oct":
          return "09";
        case "nov":
          return "10";
        case "dec":
          return "11";
      }
    };

    ViewModel.prototype.sortList = function(list, type) {
      return list.sort((function(_this) {
        return function(a, b) {
          var a_prop, b_prop;
          a_prop = parseInt(a.getRank(type));
          b_prop = parseInt(b.getRank(type));
          if (a_prop > b_prop) {
            return 1;
          }
          if (a_prop < b_prop) {
            return -1;
          }
          return 0;
        };
      })(this));
    };

    ViewModel.prototype.sortByName = function(direction) {
      if (direction != null) {
        this.sortDirection = direction;
      }
      this.searchedGames.sort((function(_this) {
        return function(a, b) {
          if (a.getName() > b.getName()) {
            return 1 * _this.sortDirection;
          }
          if (a.getName() < b.getName()) {
            return -1 * _this.sortDirection;
          }
          return 0;
        };
      })(this));
    };

    ViewModel.prototype.sortByBRating = function(direction) {
      if (direction != null) {
        this.sortDirection = direction;
      }
      this.searchedGames.sort((function(_this) {
        return function(a, b) {
          if (a.getBRating() > b.getBRating()) {
            return 1 * _this.sortDirection;
          }
          if (a.getBRating() < b.getBRating()) {
            return -1 * _this.sortDirection;
          }
          return 0;
        };
      })(this));
    };

    ViewModel.prototype.handleSort = function(type, vm, event) {
      this.sortDirection = type === this.currentSort ? -this.sortDirection : -1;
      this.currentSort = type;
      this.updateTableHeaders(type, event);
      switch (type) {
        case "name":
          this.sortByName();
          break;
        case "brating":
          this.sortByBRating();
      }
    };

    ViewModel.prototype.updateTableHeaders = function(type, event) {
      $("#results-table thead tr th").removeClass("sorting-asc");
      $("#results-table thead tr th").removeClass("sorting-desc");
      if (this.sortDirection === -1) {
        $(event.toElement).addClass("sorting-desc");
      } else {
        $(event.toElement).addClass("sorting-asc");
      }
    };

    ViewModel.prototype.searchGames = function(str) {
      var ids, regex;
      this.searchedGames.removeAll();
      if (str === "") {
        return null;
      }
      regex = new RegExp(" ", "g");
      str = str.replace(regex, "+");
      str = encodeURI(str);
      console.log(str);
      this.loading(true);
      ids = loadFromCache("searched_bgs_ids", str);
      if (ids) {
        console.log('search from cache');
        console.log(ids);
        this.getGamesDetails(ids, str);
        this.searchedGames(ids);
        this.loading(null);
        return;
      }
      $.getJSON("/search?type=boardgame&query=" + str, (function(_this) {
        return function(data) {
          ids = _this.extractIdsFromSearch(data);
          saveToCache("searched_bgs_ids", str, ids);
          _this.getGamesDetails(ids, str);
          _this.searchedGames(ids);
        };
      })(this));
    };

    ViewModel.prototype.extractIdsFromSearch = function(data) {
      var ids, item, items, _i, _len, _ref;
      console.log(data);
      if (data) {
        ids = [];
        items = data.items;
        if (Array.isArray(items)) {
          _ref = data.items;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            ids.push(item != null ? item.id : void 0);
          }
        } else {
          ids.push(items != null ? items.id : void 0);
        }
        return ids;
      }
    };

    ViewModel.prototype.getTopGames = function(type) {
      this.loading(true);
      $.getJSON('json/top100.json', (function(_this) {
        return function(data) {
          var bgdata, counter, id, items, url, _i, _len, _results;
          items = data[type];
          counter = 0;
          _results = [];
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            id = items[_i];
            bgdata = _this.loadFromCache("bgr", id);
            if (bgdata) {
              counter += 1;
              _this.topGames.push(new BoardGameResult(bgdata));
              if (counter === items.length) {
                _results.push(_this.loading(null));
              } else {
                _results.push(void 0);
              }
            } else {
              url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1";
              _results.push($.getJSON("/bgr/" + id, function(data) {
                var bgr;
                counter += 1;
                if (data) {
                  bgr = new BoardGameResult(data.items["item"]);
                  _this.topGames.push(bgr);
                  _this.saveToCache("bgr", bgr.id, bgr);
                }
                if (counter === items.length) {
                  _this.sortList(_this.topGames, _this.topGamesType());
                  _this.loading(null);
                }
              }));
            }
          }
          return _results;
        };
      })(this));
    };

    ViewModel.prototype.parseData = function(data) {
      if (data == null) {
        return;
      }
      console.log(data.id);
      if (this.boardGames[data.id] != null) {
        this.boardGames[data.id].updateData(data);
        data = this.boardGames[data.id].getData();
      }
      this.boardGames[data.id] = new BoardGame(data);
      this.boardGames.updated(Date.now());
    };

    ViewModel.prototype.getHotItems = function() {
      var data, id, _i, _len;
      this.loading(true);
      data = this.loadFromCache("hot", "games");
      if (data) {
        this.hotGames(data);
        console.log(data);
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          id = data[_i];
          if (this.boardGames[id] == null) {
            console.log(id);
            this.boardGames[id] = new BoardGame(this.loadFromCache("boardgame", id));
          }
        }
        this.loading(null);
        return;
      }
      $.getJSON('hot', (function(_this) {
        return function(data) {
          var item, _j, _len1, _ref;
          if (data) {
            _ref = data.items;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              item = _ref[_j];
              item.dataInfo = {
                'hot': 1
              };
              _this.parseData(item);
            }
            _this.hotGames((function() {
              var _k, _len2, _ref1, _results;
              _ref1 = data.items;
              _results = [];
              for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                item = _ref1[_k];
                _results.push(item.id);
              }
              return _results;
            })());
            _this.loading(null);
            _this.saveToCache("hot", "games", _this.hotGames());
          }
        };
      })(this));
    };

    ViewModel.prototype.getGameDetails = function(id, page) {
      var data, url;
      this.loading(true);
      if (page) {
        $.getJSON("bg/" + id + "/" + page, (function(_this) {
          return function(data) {
            var subnav;
            if (data) {
              _this.selectedGame(new BoardGame(data.items["item"]));
              _this.loading(null);
              subnav = $('#sub-nav').onePageNav({
                currentClass: 'active'
              });
            }
          };
        })(this));
        return;
      }
      if (page == null) {
        page = 1;
      }
      data = this.loadFromCache("bg", id);
      if (data) {
        this.selectedGame(new BoardGame(data));
        this.loading(null);
        return;
      }
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1&comments=1&pagesize=100&page=" + page;
      $.getJSON("/thing?id=" + id + "&stats=1", (function(_this) {
        return function(data) {
          var subnav;
          if (data) {
            _this.selectedGame(new BoardGame(data.items["item"]));
            _this.loading(null);
            subnav = $('#sub-nav').onePageNav({
              currentClass: 'active'
            });
            _this.saveToCache("bg", {
              'query': id
            }, _this.selectedGame());
          }
        };
      })(this));
    };

    ViewModel.prototype.getGamesDetails = function(ids) {
      var cnt, id, k, lookupids, query, url, v, _i, _j, _len, _len1;
      query = {
        'stats': 1
      };
      this.loading(true);
      console.log('getGamesDetails');
      lookupids = [];
      for (_i = 0, _len = ids.length; _i < _len; _i++) {
        id = ids[_i];
        if (this.needToRetrieveData(id, query)) {
          lookupids.push(id);
        }
      }
      cnt = 0;
      for (_j = 0, _len1 = lookupids.length; _j < _len1; _j++) {
        id = lookupids[_j];
        cnt++;
        url = "/thing?id=" + id;
        for (k in query) {
          v = query[k];
          url += "&" + k + "=" + v;
        }
        $.getJSON(url, (function(_this) {
          return function(data) {
            cnt--;
            if (data) {
              data.datainfo = query;
              _this.parseData(data);
            }
            if (cnt === 0) {
              _this.loading(null);
            }
          };
        })(this));
      }
      if (lookupids.length === 0) {
        this.loading(null);
      }
    };

    ViewModel.prototype.needToRetrieveData = function(id, dataInfo) {
      var cachedData, di, k, v;
      if (id == null) {
        return false;
      }
      if (this.boardGames[id] != null) {
        di = this.boardGames[id].dataInfo;
        for (k in dataInfo) {
          v = dataInfo[k];
          if (di[k] == null) {
            return true;
          }
        }
        return false;
      }
      cachedData = loadFromCache("boardgame", id);
      if (cachedData == null) {
        return true;
      }
      for (k in dataInfo) {
        v = dataInfo[k];
        if (cachedData[k] == null) {
          return true;
        }
      }
      this.parseData(cachedData);
      return false;
    };

    ViewModel.prototype.saveToCache = function(type, key, data) {
      if (Modernizr.sessionstorage) {
        sessionStorage["" + type + "_" + key] = ko.toJSON(data);
      }
    };

    ViewModel.prototype.loadFromCache = function(type, key) {
      var data;
      if (Modernizr.sessionstorage) {
        data = sessionStorage["" + type + "_" + key];
        if (data) {
          data = JSON.parse(data);
        }
        return data;
      }
    };

    return ViewModel;

  })();

}).call(this);
