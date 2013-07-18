/*global define*/
define( function (require) {

	//dependencies
	var _ 				= require('underscore');
	var Backbone 		= require('backbone');

	//import model
	var MyModel			= require('models/test');

	'use strict';

	//the view
	var theCollection = Backbone.Model.extend({

		model: MyModel
		
	});

	return new theCollection();
});
