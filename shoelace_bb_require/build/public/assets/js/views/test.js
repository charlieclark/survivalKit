/*global define*/
define( function (require) {

	//dependencies
	var $ 				= require('jquery');
	var _ 				= require('underscore');
	var Backbone 		= require('backbone');

	//the model
	

	//templates
	var customTemplate = require('text!templates/test.html');


	'use strict';

	//the view
	var theView = Backbone.View.extend({

		tagName: "li",

		template : _.template(customTemplate),

		events:{
			"click" : "elementClicked"
		},

		initialize : function(){
			self = this;
			this.listenTo(this.model, 'destroy', this.remove);
		},

		render : function(){
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		elementClicked : function() {
			var that = this;

			that.$el.fadeOut("slow" , function(){
				that.model.destroy();
			});
			
		}
	});

	return theView;
});
