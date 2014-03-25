(function() {
  var ViewModel;

  $(function() {
    $(document).foundation();
    ko.applyBindings(new ViewModel());
  });

  ViewModel = (function() {
    function ViewModel() {
      var self;
      self = this;
      this.searchedGames = ko.observableArray([]);
      this.selectedGame = ko.observable();
      this.searching = ko.observable(null);
      this.sortDirection = -1;
      this.currentSort = 'brating';
      Sammy(function() {
        this.get("#search/:string", function() {
          self.selectedGame(null);
          self.searchGames(this.params.string);
        });
        this.get(/#game\/(.*)(#.+)?/, function() {
          self.searchedGames.removeAll();
          self.getGameDetails(this.params.splat[0]);
        });
        this.get("", function() {});
      }).run();
    }

    ViewModel.prototype.sortByName = function(direction) {
      var sortDirection,
        _this = this;
      if (direction != null) {
        sortDirection = direction;
      }
      this.searchedGames.sort(function(a, b) {
        if (_this.getName(a.name) > _this.getName(b.name)) {
          return 1 * sortDirection;
        }
        if (_this.getName(a.name) < _this.getName(b.name)) {
          return -1 * sortDirection;
        }
        return 0;
      });
    };

    ViewModel.prototype.sortByBRating = function(direction) {
      var sortDirection,
        _this = this;
      if (direction != null) {
        sortDirection = direction;
      }
      this.searchedGames.sort(function(a, b) {
        if (_this.getBRating(a.statistics) > _this.getBRating(b.statistics)) {
          return 1 * sortDirection;
        }
        if (_this.getBRating(a.statistics) < _this.getBRating(b.statistics)) {
          return -1 * sortDirection;
        }
        return 0;
      });
    };

    ViewModel.prototype.handleSort = function(type, vm, event) {
      var currentSort, sortDirection;
      sortDirection = type === currentSort ? -sortDirection : -1;
      currentSort = type;
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
      if (sortDirection === -1) {
        $(event.toElement).addClass("headerSortDown");
      } else {
        $(event.toElement).addClass("headerSortUp");
      }
    };

    ViewModel.prototype.getRankLink = function(name, id, value) {
      if (name === "boardgame") {
        return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
      }
      return "http://boardgamegeek.com/" + name + "/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
    };

    ViewModel.prototype.getRanks = function(stats) {
      return stats.ratings.ranks.rank;
    };

    ViewModel.prototype.getAverageRating = function(stats) {
      return stats.ratings.average.value;
    };

    ViewModel.prototype.getBRating = function(stats) {
      return stats.ratings.bayesaverage.value;
    };

    ViewModel.prototype.getCategoriesFromLinks = function(links) {
      var categories, link, _i, _len;
      categories = [];
      for (_i = 0, _len = links.length; _i < _len; _i++) {
        link = links[_i];
        if (link["type"] === "boardgamecategory") {
          categories.push(link["value"]);
        }
      }
      return categories;
    };

    ViewModel.prototype.getDesignerFromLinks = function(link) {
      var _i, _len;
      for (_i = 0, _len = links.length; _i < _len; _i++) {
        link = links[_i];
        if (link["type"] === "boardgamedesigner") {
          return link["value"];
        }
      }
    };

    ViewModel.prototype.getName = function(name) {
      if (Array.isArray(name)) {
        return name[0].value;
      }
      return name.value;
    };

    ViewModel.prototype.getShortDescription = function(description) {
      return description.slice(0, 100) + "...";
    };

    ViewModel.prototype.parseDescription = function(description) {
      var contenthid, i, paragraphs, regex;
      paragraphs = 1;
      contenthid = false;
      regex = new RegExp("&#10;&#10;&#10;    ", "g");
      description = description.replace(regex, "<ul><li>");
      regex = new RegExp("&#10;&#10;&#10;", "g");
      description = description.replace(regex, "</li></ul>");
      regex = new RegExp("&#10;    ", "g");
      description = description.replace(regex, "</li><li>");
      description = "<p>" + description;
      regex = new RegExp("&#10;&#10;", "g");
      description = description.replace(regex, "</p><p>");
      description += "</p>";
      i = 0;
      while (i < description.length) {
        if (description.slice(i, i + 3) === "<p>" || description.slice(i - 5, i) === "</ul>") {
          paragraphs += 1;
          if ((paragraphs > 3 && i > 600 && description.length - i > 7) && contenthid === false) {
            description = description.slice(0, i) + "<div class='full-description' style='display:none'>" + description.slice(i, description.length);
            contenthid = true;
            break;
          }
        }
        i++;
      }
      if (contenthid) {
        description += "</div><a onclick=$('.full-description').toggle(function(){$('.show-more').toggleClass('ion-chevron-up')});><i class='show-more icon ion-chevron-down'></i></a>";
      }
      regex = new RegExp(this.getName(this.selectedGame().name), "g");
      description = description.replace(regex, "<b>" + this.getName(this.selectedGame().name) + "</b>");
      return description;
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
      this.searching(true);
      if (Modernizr.sessionstorage) {
        ids = eval("(" + sessionStorage["searched_bg_ids_" + str] + ")");
        if (ids) {
          this.getGamesDetails(ids, str);
          this.searching(null);
          return;
        }
      }
      url = "http://www.boardgamegeek.com/xmlapi/search?search=" + str;
      $.getJSON(this.getYQLurl(url), function(data) {
        ids = _this.extractIdsFromSearch(data);
        sessionStorage["searched_bg_ids_" + str] = JSON.stringify(ids);
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

    ViewModel.prototype.getGameDetails = function(id) {
      var gdata, url,
        _this = this;
      if (Modernizr.sessionstorage) {
        gdata = eval("(" + sessionStorage["bg" + id] + ")");
        if (gdata) {
          console.log("using cache");
          console.log(gdata);
          gdata["featuredComment"] = ko.observable();
          gdata.pickFeaturedComment = function() {
            gdata.featuredComment(gdata.goodComments[Math.floor(Math.random() * gdata.goodComments.length)]);
          };
          gdata.pickFeaturedComment();
          this.selectedGame(gdata);
          $("html, body").animate({
            scrollTop: 0
          }, "slow");
          return;
        }
      } else {

      }
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1&comments=1";
      $.getJSON(this.getYQLurl(url), function(data) {
        var p;
        if (data.query.results) {
          gdata = new function() {};
          for (p in data.query.results.items["item"]) {
            gdata[p] = data.query.results.items["item"][p];
          }
          if (gdata["thumbnail"] == null) {
            gdata["thumbnail"] = "";
          }
          gdata["goodComments"] = gdata.comments.comment.filter(function(el) {
            return el.value.length > 119 && parseInt(el.rating) > 0 && el.value.length < 600;
          });
          gdata["featuredComment"] = ko.observable();
          gdata.pickFeaturedComment = function() {
            gdata.featuredComment(gdata.goodComments[Math.floor(Math.random() * gdata.goodComments.length)]);
          };
          gdata.pickFeaturedComment();
          sessionStorage["bg" + id] = ko.toJSON(gdata);
          _this.selectedGame(gdata);
          $("html, body").animate({
            scrollTop: 0
          }, "slow");
        }
      });
    };

    ViewModel.prototype.getGamesDetails = function(gameids, str) {
      var counter, gdata, i, url,
        _this = this;
      if (Modernizr.sessionstorage) {
        gdata = eval("(" + sessionStorage["searched_bgs_" + str] + ")");
        if (gdata) {
          console.log("using cached search games");
          this.searching(null);
          this.searchedGames(gdata);
          this.sortByBRating(-1);
          return;
        }
      } else {

      }
      counter = 0;
      i = 0;
      while (i < gameids.length) {
        url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + gameids[i] + "&stats=1";
        $.getJSON(this.getYQLurl(url), function(data) {
          counter += 1;
          if (data.query.results) {
            gdata = data.query.results.items["item"];
            if (gdata["thumbnail"] == null) {
              gdata["thumbnail"] = "";
            }
            _this.searchedGames.push(gdata);
          }
          if (counter === gameids.length) {
            _this.searching(null);
            sessionStorage["searched_bgs_" + str] = JSON.stringify(_this.searchedGames());
            _this.sortByBRating(-1);
          }
        });
        i++;
      }
    };

    ViewModel.prototype.goToSearch = function() {
      var str;
      str = encodeURIComponent($("#search").val());
      location.hash = "search/" + str;
    };

    ViewModel.prototype.goToGame = function(object) {
      location.hash = "game/" + object.id;
    };

    return ViewModel;

  })();

}).call(this);

/*
//@ sourceMappingURL=script2.js.map
*/