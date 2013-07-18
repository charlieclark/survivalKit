var VIEWS = VIEWS || {};

(function viewClass() {
    var self = VIEWS;

    var viewArray = null;

    self.init = function () {
        viewArray = [plinkoView , mrPeanut , instructionsView];

        UTILS.tryMethodOnArray("init", viewArray);
    }

    self.animate = function () {
        UTILS.tryMethodOnArray("animate", viewArray);
    }

    self.resize = function () {
        UTILS.tryMethodOnArray("resize", viewArray);
    }

    //mouse 
    self.mouseup = function () {
        UTILS.tryMethodOnArray("mouseup", viewArray);
    }

    self.mousedown = function () {
        UTILS.tryMethodOnArray("mousedown", viewArray);
    }

    self.mousemove = function () {
        UTILS.tryMethodOnArray("mousemove", viewArray);
    }


})(VIEWS);