define(function(require){
    var $ = require("jquery");

    function init() {

        if (!CONFIG.isDev || CONFIG.liveEdit) {
            return;
        }

        //client side less compling if necessary

        //PREVENT local storage from caching the css less scripts

        localStorage.clear();

        //ADD THE LESS COMPILER AND LESS FILES.
        require(["libs/less-1.3.0.min"]);

        var linkrel = '<link rel="stylesheet/less" type="text/css" href="' + CONFIG.assetPath + '/css/global.less">';

        $('head').append(linkrel);

    }

    init();
});
