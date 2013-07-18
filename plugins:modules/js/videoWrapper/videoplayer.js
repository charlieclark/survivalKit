function videoPlayerClass(_config , _options) {

    var self = this;

    //globals set from config
    var theElement = null;
    var theID = null;
    
    var vjsPLayer = null;
    var container = null;
    var theSrcArray = [];


    var newDim = null;

    var scale = 1;

    var hasStartedPLaying = false;
    var thumbEl = null;

    var preHidePlayer = false;

    //config
    var config = {
        "url" : null,
        "id" : null,
        "element" : null,
        "videoDim" : null
    }

    var options = {
        "autoplay": true,
        "showPlayer": true,
        "loop" : true,
        "noSideHide" : false,
        "useThumbnail" : false,
        "formats" : ["mp4" , "ogv" , "webm"],
        "showFirstFrame" : true
    }

    var playerOptions = {
        "loop" : true,
        "techOrder" : [  "html5" , "flash"]
    }

   

    function init() {

        //inserting config
        for (key in config) {

            config[key] = _config[key];

            if(config[key] == null)
            {
                console.log("VIDEO PLAYER :: no config provided")
            }
        }

        //merging options
        for( key in _options) {
            options[key] = _options[key];  
        }

        playerOptions.loop = options.loop;

        //frequently used globals from options & config
        theElement = config.element;
        theID = config.id;

        //building video
        var myVideo = buildVideo();
        theElement.html(myVideo);

        //adding thumb if approp
        if(options.useThumbnail)
            addThumb();
        
        //exceptions
        browserExceptions();       

        //building vjsPlayer
        vjsPLayer = _V_(theID, playerOptions);

        //hiding player if approp

        if( options.showPlayer || !options.noSideHide) {
            hidePlayer();
        }

        if(DETECTION.isIpad || DETECTION.isAndroid)
        {
           
            if(DETECTION.isAndroid)
            {
                vjsPLayer.play();
                vjsPLayer.pause();
            }
        }
        else
        {
           vjsPLayer.load(); 
        }

        
        applyCSS();

        
        addEvents();

        $(window).resize(function(){
            self.resize();
        });

        

    }

    function applyCSS(){

        if(options.useThumbnail)
        {
    
        }

        container.css({
            "position": "absolute",
            "width": "100%",
            "height": "100%"
        });

        container.find(".videoBox").css({
            "position": "absolute"
        });

        container.find(".vjs-tech").css({
            "margin": 0,
            "padding": 0,
            "width": "100%",
            "height": "100%",
            "position": "absolute"
        });
        
    }

    function buildVideo() {

        container = $("<div>" , {
            "class" : "video-container-box"
        });

        var vid = $("<video>", {
            "id": theID,
            "class": "videoBox",
            "controls": false,
            "preload" : "auto"
        });

        var myFormats = options.formats;

        for( var i = 0 ; i < myFormats.length ; i++)
        {
            var ext =  myFormats[i] ; //for extra safety
            var ext2 = !!(ext == "ogv") ? "ogg" : ext;
            var myURL = config.url + "." + ext ;

             theSrcObj = {
                "type": "video/" + ext2,
                "src": myURL
            }

            theSrcArray.push(theSrcObj)
        }
        
        container.html(vid)


        return container;

    }

    function addThumb(){

         $("<div>" , {
            "class" : "thumb-container"
        }).css({
            "width" : "100%",
            "height" : "100%",
            "position" : "absolute"
        }).appendTo(theElement);

        function thumbLoaded( theImage ){

            thumbEl = theElement.find(".thumb-container")

            thumbEl.show();
            thumbEl.html(theImage);

            thumbEl.find("img").css({
                "width": "100%",
                "height": "100%"
            });

            self.resize();
         }

         PRELOAD.loadSingleFromGroup( options.useThumbnail.group , options.useThumbnail.name , thumbLoaded );
    }

    function browserExceptions(){

        if(DETECTION.browser == "Explorer")
        {
             playerOptions.techOrder = [ "flash" , "html5"]
        }
    }

    function showPlayer(){
        container.css({
            "left": "0",
            "visibility" : "visible"
        });
        self.resize();
    }

    function hidePlayer(){
        container.css({
            "visibility": "hidden",
            "left": "-9999px"
        })
    }


    self.play = function () {

        console.log("PLAY!!")

        if (vjsPLayer) {
            vjsPLayer.play();
        }

    }

    self.reset = function () {
        if (vjsPLayer)
            vjsPLayer.currentTime(0.1);
    }

    self.pause = function (id) {
        if (vjsPLayer)
            vjsPLayer.pause();
    }

    function addEvents() {

        //click events
        $(theElement).click(function(){
            self.play();
        });

        //video contents
        vjsPLayer.ready(function () {

            var volume = SOUND.isSoundOn() ? 1 : 0;

            vjsPLayer.src(theSrcArray);

            vjsPLayer.volume(volume);


            if (options.autoplay)
            {
                self.play();
            }

            self.resize();
                
        });

        vjsPLayer.addEvent("play", function () {

            if(!options.noSideHide) 
            {
                showPlayer();
            }

            $(self).trigger(self.VIDEO_STARTED);
        });

        vjsPLayer.addEvent("timeupdate", function (e) {

            if(vjsPLayer.currentTime() != 0 && !hasStartedPLaying)
            {
                hasStartedPLaying = true;
                $(self).trigger(self.VIDEO_STARTED_PLAYING);
            }
             
            $(self).trigger(self.VIDEO_TIMEUPDATE, e );
        });

        vjsPLayer.addEvent("ended", function () {

             
            $(self).trigger(self.VIDEO_FINISHED);
            if(options.loop)
            {
                if(DETECTION.isIphone || DETECTION.isIpad)
                {
                    
                    setTimeout(function(){
                        self.play();
                    } , 100)
                }
                self.reset();
                self.play();
            }
        });


        vjsPLayer.addEvent("canplaythrough", function () {

            if(options.showFirstFrame)
            {
                showPlayer();
            }

            if(options.autoplay)
            {
                self.play();
            }
                

            
            console.log("VIEDO LOADED")
            $(self).trigger(self.VIDEO_LOADED);
        });


        $(SOUND).bind( SOUND_ON , function(){
            vjsPLayer.volume(1);
        })

        $(SOUND).bind( SOUND_OFF , function(){
            vjsPLayer.volume(0);
        })
    }




    

    self.destroy = function () {
        
          var player = vjsPLayer;

          player.pause;      
                                                                                    
          if(player.techName == "html5" && !(DETECTION.isIphone) ){        
            player.tag.src = "";                 
            player.tech.removeTriggers();        
            player.load();                       
          }                                      
                                                       
          player.destroy();                      

          $(player.el).remove();                 
    }

    self.getDim = function(){
      return newDim;
    }

    self.scaleResize = function(_scale){
        if(vjsPLayer)
        {
            scale = _scale;
            self.resize();
        }
    }

    self.resize = function () {


        if (vjsPLayer) {


            var videoEl = theElement;

            var destH = theElement.height();
            var destW = theElement.width();

            newDim = UTILS.resizeWithExcessCalc( config.videoDim.w, config.videoDim.h, 0, destW , destH);

            var newW = newDim.w * scale;
            var newH = newDim.h * scale;

            //offsetting parent
            container.css({
                "left": (CONFIG.contentWidth - newW ) /2  + "px",
                "top": (CONFIG.contentHeight - newH ) /2  + "px"
            });

            vjsPLayer.size(newW, newH);

            //resizing container
            container.css({
                "width" : newW,
                "height" : newH
            });

            //resizing thumb
            if(thumbEl)
            {
                thumbEl.css({
                    "width" : newW,
                    "height" : newH
                });
            }

        }

    }

    init();

}

videoPlayerClass.prototype.VIDEO_STARTED_PLAYING = "videoStartedPlaying";
videoPlayerClass.prototype.VIDEO_FINISHED = "videoFinished";
videoPlayerClass.prototype.VIDEO_STARTED = "videoStarted";
videoPlayerClass.prototype.VIDEO_LOADED = "videoLoaded";
videoPlayerClass.prototype.VIDEO_TIMEUPDATE = "videoTimeUpdate";
