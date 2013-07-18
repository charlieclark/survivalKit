var SCRIPTS = SCRIPTS || {};

(function scriptClass() {
    var self = SCRIPTS;
    var jsPath = null;
    var initialScriptsLoaded = 0;

    var createGruntArray = true;

    var minURL = "min/site.js";

    var initialScripts = [
        //libs
        "libs/wipetouch.js",
        "libs/handlebars.js",

        //main scripts
        "plugins.js",
        "main.js",
        "config.js",
        "imageData.js",
        "copyData.js",

        //classes

        //utils
        "utils/general_utils.js",
        "utils/detection.js",
        "utils/preload.js",
        "utils/layout.js",
        "utils/share.js",
        "utils/viewHandler.js",
        "utils/template.js",

        //views

    ];

    var scriptList = {
        "pixi": "libs/pixi.js"
    }

    var loadedScriptArray = [];


    self.init = function () {
        jsPath = CONFIG.assetPath + "/js/";
        if (CONFIG.isDev) {
            loadInitialScripts();
        }
        else {
            loadScriptFromURL(jsPath + minURL, function () {
                mainInit();
            });
        }

    }

    function loadInitialScripts() {

        var gruntArray = "";

        for (var i = 0; i < initialScripts.length; i++) {
            var tScript = initialScripts[i];
            var theURL = jsPath + tScript;
            loadScriptFromURL(theURL, initialScriptLoad);
            gruntArray += "'public/" + jsPath + tScript + "',";
        }

        if (createGruntArray)
            console.log(gruntArray);
    }


    function initialScriptLoad() {
        initialScriptsLoaded++;
        if (initialScriptsLoaded >= initialScripts.length) {
            mainInit();
        }
    }

    self.loadScript = function (tag, onLoadCallback) {

        if (hasScriptLoaded(tag)) {
            onLoadCallback();
        }
        else {
            console.log("SCRIPTS :: load script", tag)
            loadedScriptArray.push(tag);
            var theURL = jsPath + scriptList[tag];
            loadScriptFromURL(theURL, onLoadCallback);
        }

    }

    function hasScriptLoaded(tag) {
        var hasLoaded = false;

        for (var i = 0; i < loadedScriptArray.length; i++) {
            if (tag == loadedScriptArray[i]) {
                hasLoaded = true;
            }
        }

        return hasLoaded;
    }

    function loadScriptFromURL(sURL, onLoad) {
        function loadScriptHandler() {
            var rs = this.readyState;
            if (rs == 'loaded' || rs == 'complete') {
                this.onreadystatechange = null;
                this.onload = null;
                if (onLoad) {
                    onLoad();
                }
            }
        }

        function scriptOnload() {
            this.onreadystatechange = null;
            this.onload = null;
            window.setTimeout(onLoad, 20);
        }

        var oS = document.createElement('script');
        oS.type = 'text/javascript';
        if (onLoad) {
            oS.onreadystatechange = loadScriptHandler;
            oS.onload = scriptOnload;
        }
        oS.src = sURL;
        document.getElementsByTagName('head')[0].appendChild(oS);
    }
})(SCRIPTS)