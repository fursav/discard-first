(function() {
  var ViewModel;

  $(function() {
    $(document).foundation();
    ko.applyBindings(new ViewModel());
  });

  ViewModel = function() {
    var currentSort, self, sortDirection;
    self = this;
    self.searchedGames = ko.observableArray([]);
    self.selectedGame = ko.observable();
    self.searching = ko.observable(null);
    sortDirection = -1;
    currentSort = 'brating';
    self.sortByName = function(direction) {
      if (direction != null) {
        sortDirection = direction;
      }
      self.searchedGames.sort(function(a, b) {
        if (self.getName(a.name) > self.getName(b.name)) {
          return 1 * sortDirection;
        }
        if (self.getName(a.name) < self.getName(b.name)) {
          return -1 * sortDirection;
        }
        return 0;
      });
    };
    self.sortByBRating = function(direction) {
      console.log('sorting');
      if (direction != null) {
        sortDirection = direction;
      }
      self.searchedGames.sort(function(a, b) {
        if (self.getBRating(a.statistics) > self.getBRating(b.statistics)) {
          return 1 * sortDirection;
        }
        if (self.getBRating(a.statistics) < self.getBRating(b.statistics)) {
          return -1 * sortDirection;
        }
        return 0;
      });
    };
    self.handleSort = function(type, vm, event) {
      sortDirection = type === currentSort ? -sortDirection : -1;
      currentSort = type;
      self.updateTableHeaders(type, event);
      switch (type) {
        case "name":
          self.sortByName();
          break;
        case "brating":
          self.sortByBRating();
      }
    };
    self.updateTableHeaders = function(type, event) {
      $("#results-table thead tr th").removeClass("headerSortUp");
      $("#results-table thead tr th").removeClass("headerSortDown");
      if (sortDirection === -1) {
        $(event.toElement).addClass("headerSortDown");
      } else {
        $(event.toElement).addClass("headerSortUp");
      }
    };
    self.getGoodComments = function(comments) {
      var gc;
      gc = comments.comment.filter(function(el) {
        return el.value.length > 119 && parseInt(el.rating) > 0 && el.value.length < 600;
      });
      return gc[Math.floor(Math.random() * gc.length)];
    };
    self.getRankLink = function(name, id, value) {
      if (name === "boardgame") {
        return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
      }
      return "http://boardgamegeek.com/" + name + "/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
    };
    self.getRanks = function(stats) {
      return stats.ratings.ranks.rank;
    };
    self.getAverageRating = function(stats) {
      return stats.ratings.average.value;
    };
    self.getBRating = function(stats) {
      return stats.ratings.bayesaverage.value;
    };
    self.getCategoriesFromLinks = function(link) {
      var categories, i;
      categories = [];
      i = 0;
      while (i < link.length) {
        if (link[i]["type"] === "boardgamecategory") {
          categories.push(link[i]["value"]);
        }
        i++;
      }
      return categories;
    };
    self.getDesignerFromLinks = function(link) {
      var i;
      i = 0;
      while (i < link.length) {
        if (link[i]["type"] === "boardgamedesigner") {
          return link[i]["value"];
        }
        i++;
      }
    };
    self.getName = function(name) {
      if (Array.isArray(name)) {
        return name[0].value;
      }
      return name.value;
    };
    self.getShortDescription = function(description) {
      return description.slice(0, 100) + "...";
    };
    self.parseDescription = function(description) {
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
      regex = new RegExp(self.getName(self.selectedGame().name), "g");
      description = description.replace(regex, "<b>" + self.getName(self.selectedGame().name) + "</b>");
      return description;
    };
    self.searchGames = function(str) {
      var ids, regex, url;
      self.searchedGames.removeAll();
      if (str === "") {
        return;
      }
      regex = new RegExp(" ", "g");
      str = str.replace(regex, "+");
      self.searching(true);
      if (Modernizr.sessionstorage) {
        ids = eval("(" + sessionStorage["searched_bg_ids_" + str] + ")");
        if (ids) {
          self.getGamesDetails(ids, str);
          self.searching(null);
          return;
        }
      } else {

      }
      url = "http://www.boardgamegeek.com/xmlapi/search?search=" + str;
      $.getJSON(self.getYQLurl(url), function(data) {
        ids = self.extractIdsFromSearch(data);
        sessionStorage["searched_bg_ids_" + str] = JSON.stringify(ids);
        self.getGamesDetails(ids, str);
      });
    };
    self.extractIdsFromSearch = function(data) {
      var i, ids, jdata;
      console.log(data);
      if (data.query.results) {
        jdata = data.query.results.boardgames["boardgame"];
        ids = [];
        if (Array.isArray(jdata)) {
          i = 0;
          while (i < jdata.length) {
            ids.push(jdata[i]["objectid"]);
            i++;
          }
        } else {
          ids.push(jdata["objectid"]);
        }
        return ids;
      }
    };
    self.getSomething = function() {
      var url;
      console.log("here");
      url = "http://www.boardgamegeek.com/boardgame/125618/libertalia";
      $.getJSON("http://query.yahooapis.com/v1/public/yql?" + "q=select%20*%20from%20html%20where%20url%3D%22" + encodeURIComponent(url) + "%22&format=xml'&callback=?", function(data) {
        console.log(data);
      });
    };
    self.getYQLurl = function(str) {
      var q, url;
      q = "select * from xml where url=";
      url = "'" + str + "'";
      return "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(q + url) + "&format=json&callback=?";
    };
    self.getGameDetails = function(id) {
      var gdata, url;
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
          self.selectedGame(gdata);
          $("html, body").animate({
            scrollTop: 0
          }, "slow");
          return;
        }
      } else {

      }
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1&comments=1";
      $.getJSON(self.getYQLurl(url), function(data) {
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
          self.selectedGame(gdata);
          $("html, body").animate({
            scrollTop: 0
          }, "slow");
        }
      });
    };
    self.getGamesDetails = function(gameids, str) {
      var counter, gdata, i, url;
      if (Modernizr.sessionstorage) {
        gdata = eval("(" + sessionStorage["searched_bgs_" + str] + ")");
        if (gdata) {
          console.log("using cached search games");
          self.searching(null);
          self.searchedGames(gdata);
          self.sortByBRating(-1);
          return;
        }
      } else {

      }
      counter = 0;
      i = 0;
      while (i < gameids.length) {
        url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + gameids[i] + "&stats=1";
        $.getJSON(self.getYQLurl(url), function(data) {
          counter += 1;
          if (data.query.results) {
            gdata = data.query.results.items["item"];
            if (gdata["thumbnail"] == null) {
              gdata["thumbnail"] = "";
            }
            self.searchedGames.push(gdata);
          }
          if (counter === gameids.length) {
            self.searching(null);
            sessionStorage["searched_bgs_" + str] = JSON.stringify(self.searchedGames());
            self.sortByBRating(-1);
          }
        });
        i++;
      }
    };
    self.goToSearch = function() {
      var str;
      str = encodeURIComponent($("#search").val());
      location.hash = "search/" + str;
    };
    self.goToGame = function(object) {
      location.hash = "game/" + object.id;
    };
    Sammy(function() {
      this.get("#search/:string", function() {
        self.selectedGame(null);
        self.searchGames(this.params.string);
      });
      this.get(/#game\/(.*)(#.+)?/, function() {
        console.log(this.params);
        self.searchedGames.removeAll();
        self.getGameDetails(this.params.splat[0]);
      });
      this.get("", function() {});
    }).run();
  };

}).call(this);

/*
//@ sourceMappingURL=script2.js.map
*/