/*global require*/
'use strict';

// Require.js allows us to configure shortcut alias
require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		}
	},
	paths: {
		jquery: 'libs/jquery',
		underscore: 'libs/underscore',
		backbone: 'libs/backbone',
		text: 'libs/require-text'
	}
});

require([
	'backbone',
	'views/app',
	'routers/router',
	'utils/cssLoader'
], function (Backbone, AppView) {

	console.log("getting here !!!!! !!!")
	// Initialize the application view
	new AppView();

});
