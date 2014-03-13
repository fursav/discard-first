$(function() { 
 $(document).foundation(); 
 ko.applyBindings(new ViewModel); 
 });
ViewModel = function() { 
    var self; 
    self = this; 
    self.searchedGames = ko.observableArray();
    self.searching = ko.observable(null);
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
    self.searchGames = function() { 
        self.searchedGames.removeAll();
        self.searching(true);
        url = 'http://www.boardgamegeek.com/xmlapi/search?search='+$('#search').val()
        $.getJSON("http://query.yahooapis.com/v1/public/yql?" +
         "q=select%20*%20from%20xml%20where%20url%3D%22" + 
         encodeURIComponent(url) + 
         "%22&format=xml'&callback=?", function(data){
            self.populateGames(data)
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
                console.log(ids)          
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