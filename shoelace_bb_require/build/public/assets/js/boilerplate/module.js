/*global define*/
define( function (require) {

	//dependencies
	var $ 				= require('jquery');
	// var _ 				= require('underscore');
	// var Backbone 		= require('backbone');

	//begin module with an empty object
	var self = {};

	self.init = function(){
		console.log("module initialized");

		return self;
	}

	return self.init();
});
