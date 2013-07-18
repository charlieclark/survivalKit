var LAYOUT = LAYOUT || {};

(function layoutClass() {

    var self = LAYOUT;

    var contentDim = null;

    var curOrientation = null;

    var resizeTicker = null;

    self.isLandscape = false;

    //getters


    self.init = function () {

    }


    self.preResize = function () {
        getWidthHeight();
        checkBreakpoints();
    }

    self.resize = function () {


        //resizing container
        var fullscreenCss = {
            "width": CONFIG.windowWidth,
            "height": CONFIG.windowHeight
        }

        $("#content").css(fullscreenCss);

        setContentWidthHeight(fullscreenCss.width, fullscreenCss.height);

        checkOrientation();

    }


    function checkBreakpoints() {

        var isMobile = false;

        if (CONFIG.contentWidth < 600) {
            isMobile = true;
        }

        if (isMobile) {
            layoutChange("mobile");
        }
        else {
            layoutChange("desktop")
        }

    }

    function checkOrientation() {


        var tempOrientation = null;


        if (CONFIG.windowHeight > CONFIG.windowWidth) {
            tempOrientation = "portrait";
            self.isLandscape = false;
        } else {
            tempOrientation = "landscape";
            self.isLandscape = true;
        }


        if (DETECTION.isTouchDevice && tempOrientation && tempOrientation != curOrientation) {
            curOrientation = tempOrientation;

            setTimeout(function () {
                $(window).resize();
            }, 500)
        }

    }

    function layoutChange(tag) {

        var allLayoutTags = ["desktop" , "mobile"];

        if (curLayoutTag != tag) {
            curLayoutTag = tag;

            for (var i = 0; i < allLayoutTags.length; i++) {
                $("#content").removeClass(allLayoutTags[i]);
            }

            $("#content").addClass(curLayoutTag);

            if (curLayoutTag == "mobile") {
                isMobile = true;
            }
            else {
                isMobile = false;
            }
        }
    }

    function setContentWidthHeight(w, h) {
        CONFIG.contentWidth = w;
        CONFIG.contentHeight = h;
    }

    function getWidthHeight() {

        CONFIG.windowHeight = $(window).height();
        CONFIG.windowWidth = $(window).width();

        //checking amount resized


        var resizeDistW = Math.abs(CONFIG.windowWidth - CONFIG.contentWidth);
        var resizeDistH = Math.abs(CONFIG.windowHeight - CONFIG.contentHeight);

        if ((resizeDistW > 10 || resizeDistH > 10) && DETECTION.isTouch() && DETECTION.isMobile) {
            clearTimeout(resizeTicker);
            resizeTicker = setTimeout(function () {
                checkResize();
            }, 500)
        }

        CONFIG.contentHeight = CONFIG.windowHeight;
        CONFIG.contentWidth = CONFIG.windowWidth;
    }

    function checkResize() {
        setTimeout(function () {
            MOBILE.on();
        }, 100);
    }
})(LAYOUT);

