$(function() { 
 $(document).foundation(); 
 ko.applyBindings(new ViewModel); 
 });
ViewModel = function() { 
    var self; 
    self = this; 
    self.searchedGames = ko.observableArray([]);
    self.selectedGame = ko.observable()
    self.searching = ko.observable(null);
    var nameDirection = -1;
    var bratingDirection = 1;

    self.goToSearch = function() {
        str = encodeURIComponent($("#search").val());
        location.hash = "search/" + str;
    }

    self.goToGame = function(object) { 
        //console.log(object.id)
        location.hash = "game/" + object.id
    	//self.selectedGame(object);
        //$(".columns-equal").equalize({reset: true});
    };

    self.sortByName = function(i,j){
    	$("#results-table thead tr th").removeClass("headerSortUp")
    	$("#results-table thead tr th").removeClass("headerSortDown")
        nameDirection = -nameDirection;
        if (nameDirection == 1) {        	
    		$(j.toElement).addClass("headerSortDown") 
        }
        else {       	
    		$(j.toElement).addClass("headerSortUp")
        }
        self.searchedGames.sort(function(a, b){
            if (self.getName(a.name) > self.getName(b.name)) return 1 * nameDirection;
            if (self.getName(a.name) < self.getName(b.name)) return -1 * nameDirection;
            return 0;
        });
    };

    self.sortByBRating = function(i,j){
    	$("#results-table thead tr th").removeClass("headerSortUp")
    	$("#results-table thead tr th").removeClass("headerSortDown")
        bratingDirection = -bratingDirection;
        if (bratingDirection == 1) {        	
    		$(j.toElement).addClass("headerSortDown")  
        }
        else {      	
    		$(j.toElement).addClass("headerSortUp")
        }
        self.searchedGames.sort(function(a, b){
            if (self.getBRating(a.statistics) > self.getBRating(b.statistics)) return 1 * bratingDirection;
            if (self.getBRating(a.statistics) < self.getBRating(b.statistics)) return -1 * bratingDirection;
            return 0;
        });
    };



    self.getBRating = function(stats) {
        //console.log(stats)
        return stats.ratings.bayesaverage.value
    }

    self.getCategoriesFromLinks = function(link) {
    	var categories = []
    	for (var i = 0; i < link.length; i++) {
    		if(link[i]["type"] == "boardgamecategory") {
    			categories.push(link[i]["value"])
    		}
    	};
    	return categories
    }

    self.getDesignerFromLinks = function(link) {
    	for (var i = 0; i < link.length; i++) {
    		if(link[i]["type"] == "boardgamedesigner") {
    			return link[i]["value"]
    		}
    	};
    }

    self.getName = function(name) {
        if(Array.isArray(name)) {
            return name[0].value
        }
        return name.value
    }
    self.getShortDescription = function(description) {
        return description.slice(0,100) + "...";
    } 

    self.parseDescription = function(description) {
    	var regex = new RegExp('&#10;', 'g');
    	//console.log(description.replace(regex,"<br>"));
    	return description.replace(regex,"<br>")
    }

    self.searchGames = function(str) { 
        self.searchedGames.removeAll();
        if (str == ""){
            return
        }
        self.searching(true);
        var regex = new RegExp(' ', 'g');
        str = str.replace(regex,"+");
        url = 'http://www.boardgamegeek.com/xmlapi/search?search='+str
        $.getJSON("http://query.yahooapis.com/v1/public/yql?" +
         "q=select%20*%20from%20xml%20where%20url%3D%22" + 
         encodeURIComponent(url) + 
         "%22&format=xml'&callback=?", function(data){
            console.log(url)
            self.populateGames(data);
         });
        }; 
    self.populateGames = function(data) {
        if(data.results[0]) {
            xml = $.parseXML(data.results[0])
            jdata = $.xml2json(xml);
            ids = []
            if (Array.isArray(jdata["boardgame"])) {
                for (var i = 0; i < jdata["boardgame"].length; i++) {
                    ids.push(jdata["boardgame"][i]["objectid"])
                }       
            }
            else {
                ids.push(jdata["boardgame"]["objectid"])    
            }
            self.getGamesDetails(ids)
        }
    };

    self.getGameDetails = function (id) {
        url = 'http://www.boardgamegeek.com/xmlapi2/thing?id='+ id + "&stats=1"
        $.getJSON("http://query.yahooapis.com/v1/public/yql?" +
         "q=select%20*%20from%20xml%20where%20url%3D%22" + 
         encodeURIComponent(url) + 
         "%22&format=xml'&callback=?", function(data){
            if(data.results[0]) {
                xml = $.parseXML(data.results[0])
                gdata = $.xml2json(xml)["item"];
                if (gdata["thumbnail"] == null) {
                    gdata["thumbnail"] = "";
                }
                self.selectedGame(gdata);
                console.log(gdata)
            }
         });   
    }

    self.getGamesDetails = function(gameids) {
        if (gameids.length>20 || gameids.length == 1) {
            for (var i = 0; i < gameids.length; i++) {
                url = 'http://www.boardgamegeek.com/xmlapi2/thing?id='+ gameids[i] + "&stats=1"
                $.getJSON("http://query.yahooapis.com/v1/public/yql?" +
                 "q=select%20*%20from%20xml%20where%20url%3D%22" + 
                 encodeURIComponent(url) + 
                 "%22&format=xml'&callback=?", function(data){
                    if(data.results[0]) {
                        xml = $.parseXML(data.results[0])
                        gdata = $.xml2json(xml)["item"];
                        if (gdata["thumbnail"] == null) {
                            gdata["thumbnail"] = "";
                        }
                        //console.log(gdata)
                        //onsole.log($("<div/>").html(gdata.description).text())
                        //console.log(gdata.description)
                        self.searchedGames.push(gdata);
                    }
                 });
            };
            self.searching(null);
        }
        else {
            url = 'http://www.boardgamegeek.com/xmlapi2/thing?id='+ gameids + "&stats=1"
            $.getJSON("http://query.yahooapis.com/v1/public/yql?" +
             "q=select%20*%20from%20xml%20where%20url%3D%22" + 
             encodeURIComponent(url) + 
             "%22&format=xml'&callback=?", function(data){
                if(data.results[0]) {
                    xml = $.parseXML(data.results[0])
                    jdata = $.xml2json(xml)["item"];
                    for (var i = 0; i < jdata.length; i++) {
                        if (jdata[i]["thumbnail"] == null) {
                            jdata[i]["thumbnail"] = "";
                        }
                        self.searchedGames.push(jdata[i]);
                    }
                    self.searching(null);       
                }
             });
        }        
    }

    // Client-side routes    
    Sammy(function() {
        this.get('#search/:string', function() {
            self.selectedGame(null);
            self.searchGames(this.params.string);
        });

        this.get('#game/:gameid', function() {
            //console.log(this.params.gameid)
            self.searchedGames.removeAll();
            self.getGameDetails(this.params.gameid);
        });
        this.get('', function() {
        });
    
        //this.get('', function() { this.app.runRoute('get', '#search/ ') });
    }).run();   
 };