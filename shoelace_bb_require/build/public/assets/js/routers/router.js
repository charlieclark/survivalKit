/*global define*/
define( function (require) {

	//dependencies
	var $ 				= require('jquery');
	var _ 				= require('underscore');
	var Backbone 		= require('backbone');

	'use strict';

	

	var AppRouter = Backbone.Router.extend({
		routes: {
			"posts": "getPost",
			"*actions" : "defaultRoute"
		}
	});

	var app_router = new AppRouter;

	app_router.on('route:getPost' , function(actions) {
		console.log("getting post" , actions);
	});

	app_router.on('route:defaultRoute' , function(actions) {
		// console.log(actions);
	});

	Backbone.history.start();

	return AppRouter;
});
