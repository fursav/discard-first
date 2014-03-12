$(function() { 
 $(document).foundation(); 
 ko.applyBindings(new ViewModel); 
 });
ViewModel = function() { 
 	var self; 
 	self = this; 
 	self.searchedGames = ko.observableArray(); 
 	self.searchGames = function() { 
 		self.searchedGames.removeAll();
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
 			console.log(jdata["boardgame"])
 			if (Array.isArray(jdata["boardgame"])) {
 				ids = []
	 			for (var i = 0; i < jdata["boardgame"].length; i++) {
	 				ids.push(jdata["boardgame"][i]["objectid"])
	 			}		
	 			console.log(ids)
	 			self.getGamesDetails(ids)
 			}
 			else {
 				self.searchedGames.push(jdata["boardgame"]) 				
	 		}
 		}
 	};
 	self.getGamesDetails = function(gameids) {
 		if (gameids.length>20) {
 			for (var i = 0; i < gameids.length; i++) {
 				url = 'http://www.boardgamegeek.com/xmlapi/boardgame/'+ gameids[i]
 				$.getJSON("http://query.yahooapis.com/v1/public/yql?" +
		 		 "q=select%20*%20from%20xml%20where%20url%3D%22" + 
		 		 encodeURIComponent(url) + 
		 		 "%22&format=xml'&callback=?", function(data){
		 		 	if(data.results[0]) {
			 			xml = $.parseXML(data.results[0])
			 			gdata = $.xml2json(xml);
			 			console.log(gdata["boardgame"])
						self.searchedGames.push(gdata["boardgame"])
			 		}
		 		 });
	 		};
 		}
 		else {
	 		url = 'http://www.boardgamegeek.com/xmlapi/boardgame/'+ gameids
	 		$.getJSON("http://query.yahooapis.com/v1/public/yql?" +
	 		 "q=select%20*%20from%20xml%20where%20url%3D%22" + 
	 		 encodeURIComponent(url) + 
	 		 "%22&format=xml'&callback=?", function(data){
	 		 	if(data.results[0]) {
		 			xml = $.parseXML(data.results[0])
		 			jdata = $.xml2json(xml);
		 			for (var i = 0; i < jdata["boardgame"].length; i++) {
		 				self.searchedGames.push(jdata["boardgame"][i])
		 			}		
		 		}
	 		 });
	 	}
 	}
 };