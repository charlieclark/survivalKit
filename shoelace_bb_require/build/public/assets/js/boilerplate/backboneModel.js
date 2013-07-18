/*global define*/
define( function (require) {

	//dependencies
	var _ 				= require('underscore');
	var Backbone 		= require('backbone');

	'use strict';

	//the view
	var theModel = Backbone.Model.extend({

		defaults : function(){
			title : "default title"
		},

		initialize : function(){
			console.log("initialize")
			console.log(this)
		}

	});

	return theModel;
});
