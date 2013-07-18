function sequencerClass(  _config ){
    var self = this;

    var imgArray = null;
    var el = null;
    var curImg = -1;
    var numImages = 0;
    var dim =  null;
    var newDim = null;

    var playInterval = null;

    var isPaused = false;
    var isPlaying = false;

    var canvasRef = null;
    var ctxRef = null;
    var canvasContainer = null;

    var scale = 1;
    
    var config = {
      "loop" : true,
      "autoplay" : true,
      "playInterval" : 40,
      "transparent" : false,
      "specialHeight" : false,
      "element": null,
      "showFirstFrame" : true
    }

    self.init = function(_imgArray){
      
      //mergin config
      for( key in _config)
        config[key] = _config[key];

      //global variables
      imgArray = _imgArray;
      el = config.element;
      numImages = imgArray.length;
      dim = imgArray[0].imgDim;

      if(el == null)
      {
        console.log("SEQUENCER :: no element provided")
      }

      //trigering load
      $(self).trigger(self.VIDEO_LOADED);
 
      createCanvas();

      applyCSS();

      self.resize();
      showImage(0);

      if(config.autoplay)
        self.play();

      if(config.showFirstFrame)
        showPlayer();
      else
        hidePlayer();

      $(window).resize(function(){
        self.resize();
      });

    

    }
    self.play = function(){

      if(playInterval == null)
        playInterval = setInterval(nextImage, config.playInterval);

      isPlaying = true;

      showPlayer();
      
    }

    self.stop = function(){
      isPlaying = false;
      clearInterval(playInterval);
      playInterval = null;
    }

    self.pause = function(){
      self.stop();
    }

    self.reset = function(){
      curImg = -1;
    }

    self.destroy = function(){
      self.reset();
    }

    function applyCSS(){
      canvasContainer.css({
         "position": "absolute"
       });

      canvasContainer.find("canvas").css({
        "position": "absolute",
        "width": "100%",
        "height": "100%"
      });

    }

    function showPlayer(){
      canvasContainer.css({
              "visibility": "visible",
              "left": "0px"
          });
      self.resize();
    }

    function hidePlayer(){
      canvasContainer.css({
              "visibility": "hidden",
              "left": "-9999px"
          })
    }

    function nextImage(){

      if(!isPlaying)
        return

      if(config.transparent)
      {
        ctxRef.clearRect ( 0 , 0 , canvasRef.width , canvasRef.height );
      }

      if( curImg < numImages-1)
      {
        curImg ++;
      }
      else
      {
        $(self).trigger(self.VIDEO_FINISHED);
        if(config.loop)
          curImg = 0
        else
          self.stop();
      }
      showImage(curImg);
    }

    function createCanvas(){

      canvasRef = UTILS.generateCanvas( dim );

      ctxRef = canvasRef.getContext("2d");

      canvasContainer = $("<div>" , {
        "class" : "canvas-container"
      })

      canvasContainer.html(canvasRef);

      el.html(canvasContainer)
    }

    function showImage(index){
      if (index >= 0 && index < imgArray.length){   
          ctxRef.drawImage(imgArray[index], 0, 0);
      }
    }

    self.getDim = function(){
      return newDim;
    }

    self.scaleResize = function(_scale){
        if(canvasRef)
        {
            scale = _scale;
            self.resize();
        }
    }


    self.resize = function(){
      if(!dim || !canvasRef)
        return;

      var destW = el.width();
      var destH = el.height();

      newDim = UTILS.resizeWithExcessCalc(dim.w , dim.h , 0 , destW  , destH );

      var newW = newDim.w * scale;
      var newH = newDim.h * scale;

      canvasContainer.css({
        "width" : newW,
        "height" : newH ,
        "top" : (CONFIG.contentHeight - newH ) /2 ,
        "left" : (CONFIG.contentWidth - newW ) /2 
      })
    }


}

sequencerClass.prototype.VIDEO_FINISHED = "videoFinished";
sequencerClass.prototype.VIDEO_LOADED = "videoLoaded";
