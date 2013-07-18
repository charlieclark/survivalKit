var raphaelData ={

  //common icons
  fbookIcon : "M16,0C7.164,0,0,7.164,0,16c0,8.838,7.164,16,16,16c8.837,0,16-7.162,16-16C32,7.164,24.837,0,16,0z \
   M19.428,16.006h-2.242c0,3.582,0,7.994,0,7.994h-3.322c0,0,0-4.367,0-7.994h-1.58v-2.824h1.58v-1.828 \
  c0-1.309,0.621-3.354,3.353-3.354l2.461,0.01v2.742c0,0-1.496,0-1.786,0c-0.291,0-0.705,0.145-0.705,0.77v1.66h2.533L19.428,16.006z",

  twitterIcon :"M16,0C7.164,0,0,7.164,0,16c0,8.838,7.164,16,16,16s16-7.162,16-16C32,7.164,24.836,0,16,0z M22.362,12.738\
  c0.007,0.141,0.01,0.281,0.01,0.424c0,4.338-3.302,9.34-9.34,9.34c-1.854,0-3.579-0.543-5.032-1.475\
  c0.258,0.029,0.519,0.045,0.783,0.045c1.539,0,2.953-0.523,4.076-1.404c-1.436-0.027-2.648-0.977-3.065-2.279\
  c0.2,0.037,0.405,0.059,0.617,0.059c0.3,0,0.59-0.041,0.864-0.115c-1.5-0.303-2.633-1.629-2.633-3.219c0-0.014,0-0.027,0-0.041\
  c0.443,0.246,0.949,0.393,1.487,0.41c-0.881-0.588-1.46-1.594-1.46-2.732c0-0.602,0.162-1.166,0.444-1.65\
  c1.618,1.986,4.038,3.293,6.766,3.43c-0.056-0.24-0.085-0.49-0.085-0.748c0-1.812,1.47-3.281,3.283-3.281\
  c0.943,0,1.797,0.398,2.396,1.035c0.747-0.146,1.45-0.42,2.085-0.797c-0.246,0.768-0.766,1.41-1.443,1.816\
  c0.664-0.078,1.297-0.256,1.885-0.516C23.561,11.697,23.004,12.275,22.362,12.738z",

  close:"M16,0C7.164,0,0,7.164,0,16c0,8.838,7.164,16,16,16s16-7.162,16-16C32,7.164,24.836,0,16,0z M20.95,23.778\
  L16,18.829l-4.95,4.949L8.222,20.95l4.95-4.95l-4.95-4.95l2.828-2.828l4.95,4.95l4.95-4.95l2.829,2.829l-4.95,4.95l4.95,4.949\
  L20.95,23.778z"

}

//to use:
//var r2 = new raphaelShape("twitterIcon" , $("#raphaelTest2") , config);

function raphaelShape(_id , _element , _config){

  var self = this;

  var thePaper = null;
  var thePath = null;
  var theSVG = null;
  var css = null;

  var config = {
    "stroke" : "none",
    "fill" : "#000000",
    "scaleToEl" : true
  }

  function init(){

    _element[0].raphaelShape = self;

    if(_config)
    {
      for(key in _config)
      {
        config[key] = _config[key]
      }
    }

    var myPath = raphaelData[_id];


    thePaper = Raphael(_element.attr("id"));
    thePath = thePaper.path(myPath);
    theSVG = thePaper.canvas;
   
    if(config.scaleToEl)
    {
      scaleToEl();
    }
    else
    {
      scaleToPath();
    }
  

    self.changeAttr("fill" , config.fill);
    self.changeAttr("stroke" , config.stroke);

    $(window).resize(function(){
      self.resize();
    })


  }

  self.changeAttr = function(_attr , _value){
    thePath.attr( _attr , _value )
  }

  function scaleToPath(){
     var BBox = thePath.getBBox();
      css = {
      "width" : BBox.width ,
      "height" : BBox.height 
    }
  }

  function scaleToEl(){

    var BBox = thePath.getBBox();

    var w = 40;
    var h = 40;

    css = {
      "width" : w,
      "height" : h
    } 
    
    var hRatio =  (BBox.height / h) * h  ;

    thePaper.setViewBox(0, 0, hRatio, hRatio , false);

    applyCSS();

  }

  self.resize = function(){
    scaleToEl();
    applyCSS();
  }

  function applyCSS(){
    _element.css(css)
    _element.find("svg").css(css)
  }


  init();
}