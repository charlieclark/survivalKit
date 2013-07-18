var CONFIG = CONFIG || {};

(function configClass() {

    var self = CONFIG;

    self.curURL = document.URL;

    //config
    self.assetPath = "" + "assets";
    self.imagePath = self.assetPath + "/img/";
    self.videoPath = "";
    self.AWSPath = "";
    self.prodURL = "";
    self.FBAppId = "485648611506722";  // Production facebook app id

    //global
    self.windowHeight = 0;
    self.windowWidth = 0;

    self.contentHeight = 0;
    self.contentWidth = 0;

    self.mouseX = 0;
    self.mouseY = 0;

    //deving variables
    self.isDev = false;
    self.liveEdit = false;


    function init() {
        isDebug();
        URLConditions();
    }

    function isDebug() {
        var debugHostArray = ["localhost"];
        for (var i = 0; i < debugHostArray.length; i++) {
            if (checkConfigString(debugHostArray[i], self.curURL)) {
                self.isDev = true;
            }
        }
    }

    function URLConditions() {
        var curURL = self.curURL;

        //prod exceptions

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

})(CONFIG)
 
