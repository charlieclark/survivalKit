define(["require","jquery","underscore","backbone"],function(e){var t=e("jquery"),n=e("underscore"),r=e("backbone"),i=r.Router.extend({routes:{posts:"getPost","*actions":"defaultRoute"}}),s=new i;return s.on("route:getPost",function(e){console.log("getting post",e)}),s.on("route:defaultRoute",function(e){}),r.history.start(),i});