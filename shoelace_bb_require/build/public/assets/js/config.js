/*global define*/
var CONFIG = CONFIG || {};

(function(CONFIG){
    var self = CONFIG;

    self.curURL = document.URL;

    //array of hosts that can debug
    var debugHostArray = ["localhost"];

    //config
    self.assetPath = "" + "assets";

    self.jsPath = self.assetPath + "/js";
    self.minJsPath = self.assetPath + "/min-js";

    self.imagePath = self.assetPath + "/img/";
    self.videoPath = "";
    self.AWSPath = "";
    self.prodURL = "";
    self.FBAppId = "485648611506722";  // Production facebook app id

    //default deving variables
    self.isDev = false;
    self.liveEdit = false;


    function init() {
        isDebug();
        URLConditions();
    }

    function isDebug() {
        for (var i = 0; i < debugHostArray.length; i++) {
            if (checkConfigString(debugHostArray[i], self.curURL)) {
                self.isDev = true;
            }
        }
    }

    function URLConditions() {
        var curURL = self.curURL;
    }

    function checkConfigString(checkString, targetString) {
        var contains = false;
        var index = targetString.indexOf(checkString);
        if (index >= 0) {
            return { "index": index }
        }
        else {
            return false;
        }
    }

    init();

})(CONFIG);