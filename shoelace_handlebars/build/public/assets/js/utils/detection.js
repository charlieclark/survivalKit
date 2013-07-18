var DETECTION = DETECTION || {};

(function detectionClass() {

    var self = DETECTION;

    self.isMobile = null;
    self.isTouchDevice = null;

    self.isIpad = null;
    self.isIphone = null;
    self.isIE8 = null;
    self.isIE9 = null;

    self.supportType = null;

    //browser detect
    self.appVersion = null;
    self.browser = null;
    self.browserVersion = null;
    self.OS = null;

    self.init = function () {

        browserDetect();


        self.isTouchDevice = isTouchDevice();
        self.isIpad = isIpad();
        self.isIphone = isIphone();

        self.isAndroid = isAndroid();

        self.isIE8 = isIE8();
        self.isIE9 = isIE9();

        self.isInFacebook = isInFacebook();

        self.supportType = getSupportType();

        if (self.isIpad) {
            $("body").addClass("isIpad");
        }


    }

    //public functions

    self.isTouch = function () {
        return !!('ontouchstart' in window)
    }


    //resize used to check if is mobile and other stuff
    self.resize = function () {
        self.isMobile = !!(curLayoutTag == "mobile");
    }

    //private functions

    //get general support

    function getSupportType() {

        var supportType = null;

        if (self.browser == "Explorer" && self.browserVersion == "8") {
            supportType = "IE8"
        }

        if (self.isIphone || self.isIpad || self.isAndroid) {
            supportType = "noFlash";
        }

        return supportType;
    }

    function isTouchDevice() {
        var is = false;

        if (self.isTouch())
            is = true;

        // return true
        return is;
    }

    function isInFacebook() {
        var is = false;


        if (self.isIphone && self.browser == "Safari" && self.browserVersion == "an unknown version") {
            is = true;
        }

        return is;

    }


    function isAndroid() {
        var is = false;
        if (self.isTouchDevice && !(self.isIpad || self.isIphone)) {
            is = true;
        }
        // return true
        return is;
    }


    function isIE8() {
        var is = false;

        if (self.browser == "Explorer" && self.browserVersion == "8") {
            is = true;
        }

        // return true
        return is;
    }

    function isIE9() {
        var is = false;

        if (self.browser == "Explorer" && self.browserVersion == "9") {
            is = true;
        }

        //return true
        return is;
    }


    function isIpad() {
        var i = 0,
            iOS = false,
            iDevice = ['iPad'];

        for (; i < iDevice.length; i++) {
            if (navigator.platform === iDevice[i]) {
                iOS = true;
                break;
            }
        }

        // return true
        return iOS
    }

    function isIphone() {
        var i = 0,
            iOS = false,
            iDevice = ['iPhone'];

        for (; i < iDevice.length; i++) {
            if (navigator.platform === iDevice[i]) {
                iOS = true;
                break;
            }
        }

        // return true;
        return iOS
    }

    //browser detection

    function browserDetect() {
        var BrowserDetect = {
            init: function () {
                this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
                this.version = this.searchVersion(navigator.userAgent)
                    || this.searchVersion(navigator.appVersion)
                    || "an unknown version";
                this.OS = this.searchString(this.dataOS) || "unknown";

                //setting global variables here
                self.appVersion = navigator.appVersion;
                self.browser = this.browser;
                self.browserVersion = this.version;
                self.OS = this.OS;
            },
            searchString: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    var dataProp = data[i].prop;
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) != -1)
                            return data[i].identity;
                    }
                    else if (dataProp)
                        return data[i].identity;
                }
            },
            searchVersion: function (dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index == -1) return;
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            },
            dataBrowser: [
                {
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                {    string: navigator.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                },
                {
                    string: navigator.vendor,
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                },
                {
                    prop: window.opera,
                    identity: "Opera",
                    versionSearch: "Version"
                },
                {
                    string: navigator.vendor,
                    subString: "iCab",
                    identity: "iCab"
                },
                {
                    string: navigator.vendor,
                    subString: "KDE",
                    identity: "Konqueror"
                },
                {
                    string: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                },
                {
                    string: navigator.vendor,
                    subString: "Camino",
                    identity: "Camino"
                },
                {		// for newer Netscapes (6+)
                    string: navigator.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                },
                {
                    string: navigator.userAgent,
                    subString: "MSIE",
                    identity: "Explorer",
                    versionSearch: "MSIE"
                },
                {
                    string: navigator.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                },
                { 		// for older Netscapes (4-)
                    string: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }
            ],
            dataOS: [
                {
                    string: navigator.platform,
                    subString: "Win",
                    identity: "Windows"
                },
                {
                    string: navigator.platform,
                    subString: "Mac",
                    identity: "Mac"
                },
                {
                    string: navigator.userAgent,
                    subString: "iPhone",
                    identity: "iPhone/iPod"
                },
                {
                    string: navigator.platform,
                    subString: "Linux",
                    identity: "Linux"
                }
            ]

        };
        BrowserDetect.init();
    }
})(DETECTION);