(function() {
  var BoardGame, BoardGameResult, ViewModel,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $(function() {
    $(document).foundation();
    window.vm = new ViewModel();
    ko.applyBindings(window.vm);
  });

  BoardGameResult = (function() {
    function BoardGameResult(data) {
      this.processComments = __bind(this.processComments, this);
      var key, value;
      for (key in data) {
        value = data[key];
        if (key === "comments") {
          this.comments = ko.observableArray([]);
          this.commentsPage = ko.observable();
          this.processComments(value);
        } else {
          this[key] = value;
        }
      }
      if (this.thumbnail == null) {
        this.thumbnail = "";
      }
    }

    BoardGameResult.prototype.processComments = function(data) {
      this.comments(data.comment);
      this.commentsPage(data.page);
      return this.commentsData = {
        page: data.page,
        totalitems: data.totalitems
      };
    };

    BoardGameResult.prototype.getRanks = function() {
      return this.statistics.ratings.ranks.rank;
    };

    BoardGameResult.prototype.getAverageRating = function() {
      return this.statistics.ratings.average.value;
    };

    BoardGameResult.prototype.getBRating = function() {
      return this.statistics.ratings.bayesaverage.value;
    };

    BoardGameResult.prototype.getCategories = function() {
      var categories, link, _i, _len, _ref;
      categories = [];
      _ref = this.link;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        if (link["type"] === "boardgamecategory") {
          categories.push(link["value"]);
        }
      }
      return categories;
    };

    BoardGameResult.prototype.getDesigner = function() {
      var link, _i, _len, _ref;
      _ref = this.link;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        if (link["type"] === "boardgamedesigner") {
          return link["value"];
        }
      }
    };

    BoardGameResult.prototype.getName = function() {
      if ($.type(this.name) === "array") {
        return this.name[0].value;
      }
      return this.name.value;
    };

    BoardGameResult.prototype.getShortDescription = function() {
      return this.description.slice(0, 100) + "...";
    };

    BoardGameResult.prototype.getHTMLDescription = function() {
      var contenthid, htmlDescription, i, paragraphs, regex;
      paragraphs = 1;
      contenthid = false;
      regex = new RegExp("&#10;&#10;&#10;    ", "g");
      htmlDescription = this.description.replace(regex, "<ul><li>");
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
        htmlDescription += "</div><a onclick=$('.full-description').toggle(function(){$('.show-more').toggleClass('ion-chevron-up')});><i class='show-more icon ion-chevron-down'></i></a>";
      }
      regex = new RegExp(this.getName(), "g");
      htmlDescription = htmlDescription.replace(regex, "<b>" + this.getName() + "</b>");
      return htmlDescription;
    };

    return BoardGameResult;

  })();

  BoardGame = (function(_super) {
    __extends(BoardGame, _super);

    function BoardGame(data) {
      var comment;
      BoardGame.__super__.constructor.call(this, data);
      if (this.thumbnail == null) {
        this.thumbnail = "";
      }
      if (this.goodComments == null) {
        this.goodComments = (function() {
          var _i, _len, _ref, _results;
          _ref = this.comments;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            comment = _ref[_i];
            if (comment.value.length > 119 && parseInt(comment.rating) > 0 && comment.value.length < 600) {
              _results.push(comment);
            }
          }
          return _results;
        }).call(this);
      }
      this.featuredComment = ko.observable();
      this.pickFeaturedComment();
    }

    BoardGame.prototype.getCommentsTotalPages = function() {
      return Math.ceil(this.commentsData.totalitems / 100);
    };

    BoardGame.prototype.pickFeaturedComment = function() {
      this.featuredComment(this.goodComments[Math.floor(Math.random() * this.goodComments.length)]);
    };

    BoardGame.prototype.getRankLink = function(name, id, value) {
      if (name === "boardgame") {
        return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
      }
      return "http://boardgamegeek.com/" + name + "/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
    };

    return BoardGame;

  })(BoardGameResult);

  ViewModel = (function() {
    function ViewModel() {
      this.updateTableHeaders = __bind(this.updateTableHeaders, this);
      this.goToGameComments = __bind(this.goToGameComments, this);
      var self;
      self = this;
      this.currentPage = ko.observable();
      this.searchedGames = ko.observableArray([]);
      this.selectedGame = ko.observable();
      this.loading = ko.observable(null);
      this.sortDirection = -1;
      this.currentSort = 'brating';
      Sammy(function() {
        this.get("#search/:string", function() {
          self.currentPage("searchGames");
          self.selectedGame(null);
          self.searchGames(this.params.string);
        });
        this.get("#game/:oid/comments/page/:num", function() {
          self.currentPage("gameComments");
          self.getGameDetails(this.params.oid, this.params.num);
        });
        this.get(/#game\/(.*)(#.+)?/, function() {
          self.currentPage("gameOverview");
          self.searchedGames.removeAll();
          self.getGameDetails(this.params.splat[0]);
        });
        this.get("", function() {});
      }).run();
    }

    ViewModel.prototype.goToGameComments = function() {
      location.hash = "game/" + (this.selectedGame().id) + "/comments/page/1";
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

    ViewModel.prototype.goToGameComments = function(page, bg) {
      return location.hash = "#game/" + bg.id + "/comments/page/" + page;
    };

    ViewModel.prototype.sortByName = function(direction) {
      var _this = this;
      if (direction != null) {
        this.sortDirection = direction;
      }
      this.searchedGames.sort(function(a, b) {
        if (a.getName() > b.getName()) {
          return 1 * _this.sortDirection;
        }
        if (a.getName() < b.getName()) {
          return -1 * _this.sortDirection;
        }
        return 0;
      });
    };

    ViewModel.prototype.sortByBRating = function(direction) {
      var _this = this;
      if (direction != null) {
        this.sortDirection = direction;
      }
      this.searchedGames.sort(function(a, b) {
        if (a.getBRating() > b.getBRating()) {
          return 1 * _this.sortDirection;
        }
        if (a.getBRating() < b.getBRating()) {
          return -1 * _this.sortDirection;
        }
        return 0;
      });
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
      $("#results-table thead tr th").removeClass("headerSortUp");
      $("#results-table thead tr th").removeClass("headerSortDown");
      if (this.sortDirection === -1) {
        $(event.toElement).addClass("headerSortDown");
      } else {
        $(event.toElement).addClass("headerSortUp");
      }
    };

    ViewModel.prototype.searchGames = function(str) {
      var ids, regex, url,
        _this = this;
      this.searchedGames.removeAll();
      if (str === "") {
        return;
      }
      regex = new RegExp(" ", "g");
      str = str.replace(regex, "+");
      this.loading(true);
      ids = this.loadFromCache("searched_bgs_ids", str);
      if (ids) {
        console.log("ids");
        this.loading(null);
        this.getGamesDetails(ids, str);
        return;
      }
      url = "http://www.boardgamegeek.com/xmlapi/search?search=" + str;
      $.getJSON(this.getYQLurl(url), function(data) {
        ids = _this.extractIdsFromSearch(data);
        _this.saveToCache("searched_bgs_ids", str, ids);
        _this.getGamesDetails(ids, str);
      });
    };

    ViewModel.prototype.extractIdsFromSearch = function(data) {
      var ids, jdata, object, _i, _len;
      console.log(data);
      if (data.query.results) {
        jdata = data.query.results.boardgames["boardgame"];
        ids = [];
        if (Array.isArray(jdata)) {
          for (_i = 0, _len = jdata.length; _i < _len; _i++) {
            object = jdata[_i];
            ids.push(object["objectid"]);
          }
        } else {
          ids.push(jdata["objectid"]);
        }
        return ids;
      }
    };

    ViewModel.prototype.getSomething = function() {
      var url;
      console.log("here");
      url = "http://www.boardgamegeek.com/boardgame/125618/libertalia";
      $.getJSON("http://query.yahooapis.com/v1/public/yql?" + "q=select%20*%20from%20html%20where%20url%3D%22" + encodeURIComponent(url) + "%22&format=xml'&callback=?", function(data) {
        console.log(data);
      });
    };

    ViewModel.prototype.getYQLurl = function(str) {
      var q, url;
      q = "select * from xml where url=";
      url = "'" + str + "'";
      return "http://query.yahooapis.com/v1/public/yql?q=" + (encodeURIComponent(q + url)) + "&format=json&callback=?";
    };

    ViewModel.prototype.getGameDetails = function(id, page) {
      var data, url,
        _this = this;
      if (page) {
        url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1&comments=1&pagesize=100&page=" + page;
        $.getJSON(this.getYQLurl(url), function(data) {
          if (data.query.results) {
            _this.selectedGame(new BoardGame(data.query.results.items["item"]));
          }
        });
        return;
      }
      if (page == null) {
        page = 1;
      }
      data = this.loadFromCache("bg", id);
      if (data) {
        this.selectedGame(new BoardGame(data));
        return;
      }
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1&comments=1&pagesize=100&page=" + page;
      $.getJSON(this.getYQLurl(url), function(data) {
        if (data.query.results) {
          _this.selectedGame(new BoardGame(data.query.results.items["item"]));
          _this.saveToCache("bg", id, _this.selectedGame());
        }
      });
    };

    ViewModel.prototype.getGameComments = function(id, page) {
      var url,
        _this = this;
      this.loading(true);
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&comments=1&pagesize=100&page=" + page;
      $.getJSON(this.getYQLurl(url), function(data) {
        if (data.query.results) {
          _this.selectedGame().processComments(data.query.results.items["item"]["comments"]);
          _this.loading(null);
          $(".page-slider").noUiSlider({
            start: parseInt(_this.params.num),
            step: 1,
            range: {
              'min': 1,
              'max': parseInt(self.selectedGame().getCommentsTotalPages())
            },
            serialization: {
              lower: [
                new Link({
                  target: $('#page-num')
                })
              ],
              format: {
                decimals: 0
              }
            }
          }, true);
        }
      });
    };

    ViewModel.prototype.getGamesDetails = function(gameids, str) {
      var counter, data, i, result, url,
        _this = this;
      data = this.loadFromCache("searched_bgs", str);
      if (data) {
        console.log("using cached search games");
        this.loading(null);
        this.searchedGames((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            result = data[_i];
            _results.push(new BoardGameResult(result));
          }
          return _results;
        })());
        this.sortByBRating(-1);
        return;
      }
      counter = 0;
      i = 0;
      while (i < gameids.length) {
        url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + gameids[i] + "&stats=1";
        $.getJSON(this.getYQLurl(url), function(data) {
          counter += 1;
          if (data.query.results) {
            _this.searchedGames.push(new BoardGameResult(data.query.results.items["item"]));
          }
          if (counter === gameids.length) {
            _this.loading(null);
            _this.saveToCache("searched_bgs", str, _this.searchedGames());
            _this.sortByBRating(-1);
          }
        });
        i++;
      }
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

/*
//@ sourceMappingURL=script2.js.map
*/