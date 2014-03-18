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

    self.getGoodComments = function(comments) {
        gc = comments.comment.filter(function(el) {
            return el.value.length > 119 && parseInt(el.rating) > 0
        })
        return gc[Math.floor(Math.random()*gc.length)]
    }

    self.getRankLink = function(name,id,value) {
        if (name == "boardgame") {
            return 'http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=' + 
            id + '&rank=' + value + '#' + value
        }
        return 'http://boardgamegeek.com/' + name + '/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=' + 
            id + '&rank=' + value + '#' + value
        
    }

    self.getRanks = function(stats) {
        return stats.ratings.ranks.rank
    }

    self.getAverageRating = function(stats) {
        return stats.ratings.average.value
    }

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
        description = description.replace(regex,"<br>")
        regex = new RegExp(self.getName(self.selectedGame().name), 'g');
        description = description.replace(regex,"<b>" + self.getName(self.selectedGame().name) + "</b>")
    	//console.log(description.replace(regex,"<br>"));
    	return description
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

    self.getSomething = function() {
    	console.log("here")
    	url = "http://www.boardgamegeek.com/boardgame/125618/libertalia"
    	$.getJSON("http://query.yahooapis.com/v1/public/yql?"+
                "q=select%20*%20from%20html%20where%20url%3D%22"+
                encodeURIComponent(url)+
                "%22&format=xml'&callback=?", function(data){
    			console.log(data)
    	})
    }

    self.getGameDetails = function (id) {
        url = 'http://www.boardgamegeek.com/xmlapi2/thing?id='+ id + "&stats=1&comments=1"
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
                $('html, body').animate({scrollTop:0}, 'slow');
                //equalHeight($(".columns-equal > div"));
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


    self.goToSearch = function() {
        str = encodeURIComponent($("#search").val());
        location.hash =  "search/" + str;
    }

    self.goToGame = function(object) { 
        location.hash = "game/" + object.id
    };

    //routing
    // Client-side routes    
    Sammy(function() {
        this.get('#search/:string', function() {
            self.selectedGame(null);
            self.searchGames(this.params.string);
        });

        this.get(/#game\/(.*)(#.+)?/, function() {
            console.log(this.params)
            self.searchedGames.removeAll();
            self.getGameDetails(this.params.splat[0]);
        });
        this.get('', function() {
        });
    
        //this.get('', function() { this.app.runRoute('get', '#search/ ') });
    }).run();
 };

 function equalHeight(group) {
	var tallest = 0;
	group.each(function() {
		var thisHeight = $(this).height();
 		console.log(thisHeight)
		if(thisHeight > tallest) {
			tallest = thisHeight;
		}
	});
	group.height(tallest);
}

function OnImageLoad(evt) {
    var img = evt.currentTarget;

    // what's the size of this image and it's parent
    var w = $(img).width();
    var h = $(img).height();
    var tw = $(img).parent().width();
    var th = $(img).parent().height();
	console.log(tw)
	console.log(th)

    // compute the new size and offsets
    var result = ScaleImage(w, h, tw, th, false);

    // adjust the image coordinates and size
    img.width = result.width;
    img.height = result.height;
    $(img).css("left", result.targetleft);
    $(img).css("top", result.targettop);
}

function ScaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {

    var result = { width: 0, height: 0, fScaleToTargetWidth: true };

    if ((srcwidth <= 0) || (srcheight <= 0) || (targetwidth <= 0) || (targetheight <= 0)) {
        return result;
    }

    // scale to the target width
    var scaleX1 = targetwidth;
    var scaleY1 = (srcheight * targetwidth) / srcwidth;

    // scale to the target height
    var scaleX2 = (srcwidth * targetheight) / srcheight;
    var scaleY2 = targetheight;

    // now figure out which one we should use
    var fScaleOnWidth = (scaleX2 > targetwidth);
    if (fScaleOnWidth) {
        fScaleOnWidth = fLetterBox;
    }
    else {
       fScaleOnWidth = !fLetterBox;
    }

    if (fScaleOnWidth) {
        result.width = Math.floor(scaleX1);
        result.height = Math.floor(scaleY1);
        result.fScaleToTargetWidth = true;
    }
    else {
        result.width = Math.floor(scaleX2);
        result.height = Math.floor(scaleY2);
        result.fScaleToTargetWidth = false;
    }
    result.targetleft = Math.floor((targetwidth - result.width) / 2);
    result.targettop = Math.floor((targetheight - result.height) / 2);

    return result;
}