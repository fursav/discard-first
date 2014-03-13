$(function() { 
 $(document).foundation(); 
 ko.applyBindings(new ViewModel); 
 });
ViewModel = function() { 
    var self; 
    self = this; 
    self.searchedGames = ko.observableArray();
    self.selectedGame = ko.observable()
    self.searching = ko.observable(null);
    var nameDirection = -1;
    var rankDirection = 1;

    self.goToGame = function(object) { 
    	self.selectedGame(object);
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

    self.sortByRank = function(i,j){
    	$("#results-table thead tr th").removeClass("headerSortUp")
    	$("#results-table thead tr th").removeClass("headerSortDown")
        rankDirection = -rankDirection;
        if (rankDirection == 1) {        	
    		$(j.toElement).addClass("headerSortDown")  
        }
        else {      	
    		$(j.toElement).addClass("headerSortUp")
        }
        self.searchedGames.sort(function(a, b){
            if (self.getRank(a.statistics) > self.getRank(b.statistics)) return 1 * rankDirection;
            if (self.getRank(a.statistics) < self.getRank(b.statistics)) return -1 * rankDirection;
            return 0;
        });
    };



    self.getRank = function(stats) {
        console.log(stats)
        return stats.ratings.bayesaverage.value
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
    	console.log(description.replace(regex,"<br>"));
    	return description.replace(regex,"<br>")
    }

    self.searchGames = function() { 
        self.searchedGames.removeAll();
        self.searching(true);
        url = 'http://www.boardgamegeek.com/xmlapi/search?search='+$('#search').val()
        $.getJSON("http://query.yahooapis.com/v1/public/yql?" +
         "q=select%20*%20from%20xml%20where%20url%3D%22" + 
         encodeURIComponent(url) + 
         "%22&format=xml'&callback=?", function(data){
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
                        console.log(gdata)
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
 };