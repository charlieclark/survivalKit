/*global define*/
define( function (require) {

	//dependencies
	var _ 				= require('underscore');
	var Backbone 		= require('backbone');

	//data
						  require('data/copyData');

	'use strict';

	//the view
	var theModel = Backbone.Model.extend({

		defaults : {
			title : "no title provided",
			other : "other stuff"
		},

		copy : copyData.testDefaults,

		initialize : function(){
			var randomName = this.copy.possibleNames[ Math.floor( Math.random() * this.copy.possibleNames.length ) ];
			this.set({title : randomName});
		}

	});

	return theModel;
});
