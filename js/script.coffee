$ ->
	$(document).foundation()
	ko.applyBindings(new ViewModel)
	return

ViewModel = ->
	self = this
	self.searchedGames = ko.observableArray()
	
	#Behaviours
	self.searchGames = ->
		$.getJSON("http://query.yahooapis.com/v1/public/yql?"+               "q=select%20*%20from%20xml%20where%20url%3D%22"+
                encodeURIComponent(url)+
                "%22&format=xml'&callback=?",self.populateGames(data))
		return
	self.populateGames = (data) ->
		return
	return
	
