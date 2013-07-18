/*global define*/
define( function (require) {

	//dependencies
	var $ 				= require('jquery');
	var _ 				= require('underscore');
	var Backbone 		= require('backbone');

	//utils
	var Preload 		= require('utils/preload');

	//data
						  require('data/copyData');

	//import views etc.
	var TestView		= require('views/test');
	var TestCollection	= require('collections/test');


	'use strict';

	//the view
	var AppView = Backbone.View.extend({

		el: "#myApp",

		events:{
			"click #content" : "addTestItem"
		},

		initialize : function(){
			this.listenTo(TestCollection, 'add', this.addOne)
		},

		addOne : function(todo){
			var view = new TestView({model:todo});
			$("#testList").append(view.render().el);
		},

		addTestItem : function() {
			TestCollection.add(copyData.otherTestCopy);
		}
	});

	return AppView;
});
