/*global define*/
define( function (require) {

	//dependencies
	var $ 				= require('jquery');
	var _ 				= require('underscore');
	var Backbone 		= require('backbone');

	//templates
	var customTemplate = require('text!templates/stats.html');


	'use strict';

	//the view
	var AppView = Backbone.View.extend({

		el: "",

		template : _.template(customTemplate),

		events:{
			// "click #something" : "executeFunction"
		},

		initialize : function(){
			console.log("initialize")
			console.log(this)
		}
	});

	return AppView;
});
