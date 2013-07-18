//global vars
var curLang = "en";
var curLayoutTag = null;
var isMobile = false;


function mainInit() {

    buildTemplates();

    //initializing singletons
    DETECTION.init();
    LAYOUT.init();
    PRELOAD.init();

    //initializing views with an array
    VIEWS.init([]);


    if (DETECTION.isTouchDevice) {

        $(document).wipetouch({
            tapToClick: true
        });

        touchEvents();
    }
    else {
        mouseEvents();
    }

    //begin render loop
    animate();

    keyEvents();

    $(window).resize();

}

function buildTemplates(){

    // TEMPLATE.compileTemplate("instructions-template", copyData["instructions"], $("#instructions"));
    
}

function animate() {
    // window.requestAnimationFrame(animate);
    // renderLoop();
}

function renderLoop() {
    //render classes here
    // VIEWS.animate();
}


function mouseEvents() {


    //global
    $("#content").mousedown(function (e) {
        getMousePoints(e);
        mouseTouchStart();
    });

    $("#content").mousemove(function (e) {
        getMousePoints(e);
        mouseTouchMove();
    });

    $("#content").mouseup(function (e) {
        getMousePoints(e);
        mouseTouchEnd();
    });

    function getMousePoints(e) {
        var mouseX = e.pageX;
        var mouseY = e.pageY;
        setMousePoints(mouseX, mouseY);
    }
}

function touchEvents() {

    document.ontouchstart = function (e) {

        var touchY = e.touches[0].pageY;
        var touchX = e.touches[0].pageX;
        setMousePoints(touchX, touchY);
        mouseTouchStart();

    };
    document.ontouchmove = function (e) {

        var touchY = e.touches[0].pageY;
        var touchX = e.touches[0].pageX;
        setMousePoints(touchX, touchY);
        mouseTouchMove();
    };
    document.ontouchend = function (e) {

        mouseTouchEnd();
    };
}

function setMousePoints(x, y) {
    CONFIG.mouseX = x;
    CONFIG.mouseY = y;
}


//global mouse/touch triggers
function mouseTouchStart() {
    VIEWS.mousedown();
}

function mouseTouchEnd() {
    VIEWS.mouseup();
}

function mouseTouchMove() {
    VIEWS.mousemove();
}

//keyboard events
function keyEvents() {

    $(window).keyup(function (e) {
        var charCode = e.which;
    });
}

//resize logic

$(window).resize(function () {



    //resize this first
    LAYOUT.preResize();
    DETECTION.resize();

    //then other things
    LAYOUT.resize();

    //resizing views
    VIEWS.resize();

});


